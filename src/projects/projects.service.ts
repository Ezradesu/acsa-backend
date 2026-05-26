import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async findAll() {
    return this.prisma.project.findMany({
      include: {
        images: true,
        products: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        images: true,
        products: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  private async validateProductIds(idProducts: string[]) {
    const uniqueProductIds = [...new Set(idProducts)];

    if (uniqueProductIds.length !== idProducts.length) {
      throw new BadRequestException('Product tidak boleh duplikat');
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: uniqueProductIds } },
    });

    if (products.length !== uniqueProductIds.length) {
      throw new NotFoundException('Satu atau lebih Product tidak ditemukan');
    }
  }

  async create(dto: CreateProjectDto) {
    await this.validateProductIds(dto.id_products);

    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : undefined,
        location: dto.location,
        category: dto.category,
        products: {
          create: dto.id_products.map((id_product) => ({
            id_product,
          })),
        },
      },
      include: {
        products: {
          include: {
            product: { include: { images: true } },
          },
        },
        images: true,
      },
    });
  }

  async update(id: number, dto: UpdateProjectDto) {
    await this.findOne(id);

    // Jika id_products dikirim, validasi dan update relasi
    if (dto.id_products) {
      await this.validateProductIds(dto.id_products);
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.id_products) {
        await tx.projectProduct.deleteMany({
          where: { id_project: id },
        });
      }

      return tx.project.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          date: dto.date ? new Date(dto.date) : undefined,
          location: dto.location,
          category: dto.category,
          ...(dto.id_products && {
            products: {
              create: dto.id_products.map((id_product) => ({
                id_product,
              })),
            },
          }),
        },
        include: {
          products: {
            include: {
              product: { include: { images: true } },
            },
          },
          images: true,
        },
      });
    });
  }

  async remove(id: number) {
    const project = await this.findOne(id);

    // Hapus semua images dari storage
    for (const image of project.images) {
      const path = new URL(image.image_url).pathname
        .split('/')
        .slice(-2)
        .join('/');
      await this.supabase.deleteFile(
        process.env.SUPABASE_STORAGE_BUCKET!,
        path,
      );
    }

    return this.prisma.project.delete({ where: { id } });
  }

  async uploadImages(id: number, files: Express.Multer.File[]) {
    await this.findOne(id);

    const uploads = await Promise.all(
      files.map((file) => {
        const path = `projects/${id}/${Date.now()}-${file.originalname}`;
        return this.supabase.uploadFile(
          process.env.SUPABASE_STORAGE_BUCKET!,
          path,
          file,
        );
      }),
    );

    await this.prisma.projectImages.createMany({
      data: uploads.map((url) => ({ id_project: id, image_url: url })),
    });

    return this.prisma.projectImages.findMany({ where: { id_project: id } });
  }

  async deleteImage(id: number, imageId: number) {
    const image = await this.prisma.projectImages.findUnique({
      where: { id: imageId },
    });
    if (!image) throw new NotFoundException('Image not found');

    const path = new URL(image.image_url).pathname
      .split('/')
      .slice(-2)
      .join('/');
    await this.supabase.deleteFile(process.env.SUPABASE_STORAGE_BUCKET!, path);

    return this.prisma.projectImages.delete({ where: { id: imageId } });
  }
}
