import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CatalogCacheService } from '../cache/catalog-cache.service';
import { ProductSearchService } from '../search/product-search.service';
import { Prisma } from '../../prisma/@prisma/client/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
    private cache: CatalogCacheService,
    private searchService: ProductSearchService,
  ) {}

  async findAll(query: QueryProductDto) {
    const {
      search,
      id_brand,
      id_category,
      id_ac_type,
      page = 1,
      limit = 10,
      min_price,
      max_price,
      sortBy,
      sortOrder,
    } = query;
    const skip = (page - 1) * limit;
    const cached = await this.cache.get<{
      data: unknown[];
      meta: { total: number; page: number; limit: number; total_pages: number };
    }>('products:list', query);
    if (cached) return cached;

    if (search) {
      const result = await this.searchService.search({
        ...query,
        search,
        page,
        limit,
      });
      if (result) {
        const products = await this.prisma.product.findMany({
          where: { id: { in: result.ids } },
          include: {
            brand: true,
            images: true,
            category: true,
            ac_type: true,
            discounts: true,
          },
        });
        const byId = new Map(products.map((product) => [product.id, product]));
        const response = {
          data: result.ids
            .map((id) => byId.get(id))
            .filter((product) => product !== undefined),
          meta: {
            total: result.total,
            page,
            limit,
            total_pages: Math.ceil(result.total / limit),
          },
        };
        await this.cache.set('products:list', query, response);
        return response;
      }
    }

    const where: Prisma.ProductWhereInput = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (id_brand && id_brand.length > 0) {
      where.id_brand = { in: id_brand };
    }
    if (id_ac_type) where.id_ac_type = id_ac_type;
    if (id_category && id_category.length > 0) {
      where.id_category = { in: id_category };
    }
    if (query.freon_type)
      where.freon_type = { contains: query.freon_type, mode: 'insensitive' };
    if (query.model_code)
      where.model_code = { contains: query.model_code, mode: 'insensitive' };
    if (query.series_name)
      where.series_name = { contains: query.series_name, mode: 'insensitive' };

    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price.gte = min_price;
      if (max_price) where.price.lte = max_price;
    }

    if (!query.includeDeleted) {
      where.is_deleted = false;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = {
      created_at: 'desc',
    };
    if (sortBy === 'price') {
      orderBy = { price: sortOrder || 'asc' };
    } else if (sortBy === 'date') {
      orderBy = { created_at: sortOrder || 'desc' };
    } else if (sortOrder) {
      orderBy = { created_at: sortOrder };
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          brand: true,
          images: true,
          category: true,
          ac_type: true,
          discounts: true,
        },
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    const response = {
      data,
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
    await this.cache.set('products:list', query, response);
    return response;
  }

  async findOne(id: string) {
    const cached = await this.cache.get<unknown>('products:detail', id);
    if (cached) return cached;
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        images: true,
        category: true,
        ac_type: true,
        reviews: {
          include: {
            user: { select: { id: true, first_name: true, last_name: true } },
          },
        },
        discounts: true,
        featuredProducts: true,
      },
    });
    if (!product || product.is_deleted)
      throw new NotFoundException('Product not found');
    await this.cache.set('products:detail', id, product);
    return product;
  }

  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        ...dto,
        price: dto.price,
      },
      include: {
        brand: true,
        category: true,
        ac_type: true,
      },
    });
    await Promise.all([
      this.cache.invalidateCatalog(),
      this.searchService.syncProduct(product.id),
    ]);
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: dto,
      include: {
        brand: true,
        category: true,
        ac_type: true,
      },
    });
    await Promise.all([
      this.cache.invalidateCatalog(),
      this.searchService.syncProduct(product.id),
    ]);
    return product;
  }

  async remove(id: string) {
    await this.findOne(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: { is_deleted: true },
    });
    await Promise.all([
      this.cache.invalidateCatalog(),
      this.searchService.syncProduct(product.id),
    ]);
    return product;
  }

  async uploadImages(id: string, files: Express.Multer.File[]) {
    await this.findOne(id);

    const uploads = await Promise.all(
      files.map((file) => {
        const path = `products/${id}/${Date.now()}-${file.originalname}`;
        return this.supabase.uploadFile(
          process.env.SUPABASE_STORAGE_BUCKET!,
          path,
          file,
        );
      }),
    );

    await this.prisma.productImages.createMany({
      data: uploads.map((url) => ({ id_product: id, image_url: url })),
    });

    const images = await this.prisma.productImages.findMany({
      where: { id_product: id },
    });
    await this.cache.invalidateCatalog();
    return images;
  }

  async deleteImage(id: string, imageId: number) {
    const image = await this.prisma.productImages.findUnique({
      where: { id: imageId },
    });
    if (!image) throw new NotFoundException('Image not found');
    if (image.id_product !== id) throw new NotFoundException('Image not found');

    const bucket = process.env.SUPABASE_STORAGE_BUCKET!;
    const marker = `/object/public/${bucket}/`;
    const pathname = new URL(image.image_url).pathname;
    const markerIndex = pathname.indexOf(marker);
    if (markerIndex < 0) {
      throw new BadRequestException(
        'Product image URL is not a public Supabase URL',
      );
    }
    const path = decodeURIComponent(
      pathname.slice(markerIndex + marker.length),
    );
    await this.supabase.deleteFile(bucket, path);
    const deleted = await this.prisma.productImages.delete({
      where: { id: imageId },
    });
    await this.cache.invalidateCatalog();
    return deleted;
  }
}
