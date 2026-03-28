import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
    constructor(
        private prisma: PrismaService,
        private supabase: SupabaseService,
    ) { }

    async findAll() {
        return this.prisma.article.findMany({
            include: { images: true },
            orderBy: { created_at: 'desc' },
        });
    }

    async findOne(id: number) {
        const article = await this.prisma.article.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!article) throw new NotFoundException('Article not found');
        return article;
    }

    async create(dto: CreateArticleDto) {
        return this.prisma.article.create({
            data: dto,
            include: { images: true },
        });
    }

    async update(id: number, dto: UpdateArticleDto) {
        await this.findOne(id);
        return this.prisma.article.update({
            where: { id },
            data: dto,
            include: { images: true },
        });
    }

    async remove(id: number) {
        const article = await this.findOne(id);

        // Hapus semua images dari storage
        for (const image of article.images) {
            const path = new URL(image.image_url).pathname.split('/').slice(-2).join('/');
            await this.supabase.deleteFile(process.env.SUPABASE_STORAGE_BUCKET!, path);
        }

        return this.prisma.article.delete({ where: { id } });
    }

    async uploadImages(id: number, files: Express.Multer.File[]) {
        await this.findOne(id);

        const uploads = await Promise.all(
            files.map((file) => {
                const path = `articles/${id}/${Date.now()}-${file.originalname}`;
                return this.supabase.uploadFile(
                    process.env.SUPABASE_STORAGE_BUCKET!,
                    path,
                    file,
                );
            }),
        );

        await this.prisma.articleImages.createMany({
            data: uploads.map((url) => ({ id_artikel: id, image_url: url })),
        });

        return this.prisma.articleImages.findMany({ where: { id_artikel: id } });
    }

    async deleteImage(id: number, imageId: number) {
        const image = await this.prisma.articleImages.findUnique({
            where: { id: imageId },
        });
        if (!image) throw new NotFoundException('Image not found');

        const path = new URL(image.image_url).pathname.split('/').slice(-2).join('/');
        await this.supabase.deleteFile(process.env.SUPABASE_STORAGE_BUCKET!, path);

        return this.prisma.articleImages.delete({ where: { id: imageId } });
    }
}