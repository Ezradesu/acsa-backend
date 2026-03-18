import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        private prisma: PrismaService,
        private supabase: SupabaseService,
    ) { }

    async findAll(query: QueryProductDto) {
        const { search, id_brand, id_category, type, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) where.name = { contains: search, mode: 'insensitive' };
        if (id_brand) where.id_brand = id_brand;
        if (type) where.type = type;
        if (id_category) {
            where.categories = { some: { id_category } };
        }

        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                include: {
                    brand: true,
                    images: true,
                    categories: { include: { category: true } },
                    discounts: true,
                },
                orderBy: { created_at: 'desc' },
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                brand: true,
                images: true,
                categories: { include: { category: true } },
                reviews: { include: { user: { select: { id: true, first_name: true, last_name: true } } } },
                discounts: true,
                featuredProducts: true,
            },
        });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async create(dto: CreateProductDto) {
        const { category_ids, ...data } = dto;
        return this.prisma.product.create({
            data: {
                ...data,
                price: data.price,
                categories: category_ids
                    ? {
                        create: category_ids.map((id) => ({ id_category: id })),
                    }
                    : undefined,
            },
            include: {
                brand: true,
                categories: { include: { category: true } },
            },
        });
    }

    async update(id: string, dto: UpdateProductDto) {
        await this.findOne(id);
        const { category_ids, ...data } = dto;

        return this.prisma.product.update({
            where: { id },
            data: {
                ...data,
                categories: category_ids
                    ? {
                        deleteMany: {},
                        create: category_ids.map((catId) => ({ id_category: catId })),
                    }
                    : undefined,
            },
            include: {
                brand: true,
                categories: { include: { category: true } },
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.product.delete({ where: { id } });
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

        return this.prisma.productImages.findMany({ where: { id_product: id } });
    }

    async deleteImage(id: string, imageId: number) {
        const image = await this.prisma.productImages.findUnique({
            where: { id: imageId },
        });
        if (!image) throw new NotFoundException('Image not found');

        const path = new URL(image.image_url).pathname.split('/').slice(-2).join('/');
        await this.supabase.deleteFile(process.env.SUPABASE_STORAGE_BUCKET!, path);
        return this.prisma.productImages.delete({ where: { id: imageId } });
    }
}