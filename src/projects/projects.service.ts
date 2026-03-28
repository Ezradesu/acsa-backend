import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
    constructor(
        private prisma: PrismaService,
        private supabase: SupabaseService,
    ) { }

    async findAll() {
        return this.prisma.project.findMany({
            include: {
                images: true,
                product: { include: { images: true } },
            },
            orderBy: { date: 'desc' },
        });
    }

    async findOne(id: number) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                images: true,
                product: { include: { images: true } },
            },
        });
        if (!project) throw new NotFoundException('Project not found');
        return project;
    }

    async create(dto: CreateProjectDto) {
        const product = await this.prisma.product.findUnique({
            where: { id: dto.id_product },
        });
        if (!product) throw new NotFoundException('Product not found');

        return this.prisma.project.create({
            data: {
                id_product: dto.id_product,
                name: dto.name,
                description: dto.description,
                date: dto.date ? new Date(dto.date) : undefined,
                location: dto.location,
                category: dto.category,
            },
            include: { images: true, product: true },
        });
    }

    async update(id: number, dto: UpdateProjectDto) {
        await this.findOne(id);
        return this.prisma.project.update({
            where: { id },
            data: {
                ...dto,
                date: dto.date ? new Date(dto.date) : undefined,
            },
            include: { images: true, product: true },
        });
    }

    async remove(id: number) {
        const project = await this.findOne(id);

        // Hapus semua images dari storage
        for (const image of project.images) {
            const path = new URL(image.image_url).pathname.split('/').slice(-2).join('/');
            await this.supabase.deleteFile(process.env.SUPABASE_STORAGE_BUCKET!, path);
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

        const path = new URL(image.image_url).pathname.split('/').slice(-2).join('/');
        await this.supabase.deleteFile(process.env.SUPABASE_STORAGE_BUCKET!, path);

        return this.prisma.projectImages.delete({ where: { id: imageId } });
    }
}