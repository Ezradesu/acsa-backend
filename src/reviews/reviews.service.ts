import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async findByProduct(productId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) throw new NotFoundException('Product not found');

        const reviews = await this.prisma.review.findMany({
            where: { id_product: productId },
            include: {
                user: {
                    select: { id: true, first_name: true, last_name: true },
                },
            },
            orderBy: { created_at: 'desc' },
        });

        // Hitung rata-rata rating
        const avgRating =
            reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;

        return {
            data: reviews,
            avg_rating: Math.round(avgRating * 10) / 10,
            total: reviews.length,
        };
    }

    async findOne(id: number) {
        const review = await this.prisma.review.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, first_name: true, last_name: true },
                },
                product: true,
            },
        });
        if (!review) throw new NotFoundException('Review not found');
        return review;
    }

    async create(userId: string, productId: string, dto: CreateReviewDto) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) throw new NotFoundException('Product not found');

        // Cek apakah user sudah pernah review product ini
        const existing = await this.prisma.review.findFirst({
            where: { id_product: productId, id_user: userId },
        });
        if (existing) throw new ConflictException('You have already reviewed this product');

        // Cek apakah user pernah beli product ini
        const hasPurchased = await this.prisma.orderItems.findFirst({
            where: {
                id_product: productId,
                order: { id_user: userId, status: 'delivered' },
            },
        });
        if (!hasPurchased) {
            throw new ForbiddenException('You can only review products you have purchased');
        }

        return this.prisma.review.create({
            data: {
                id_product: productId,
                id_user: userId,
                rating: dto.rating,
                comment: dto.comment,
            },
            include: {
                user: {
                    select: { id: true, first_name: true, last_name: true },
                },
            },
        });
    }

    async update(id: number, userId: string, role: string, dto: UpdateReviewDto) {
        const review = await this.findOne(id);

        if (role !== 'admin' && review.id_user !== userId) {
            throw new ForbiddenException('You can only update your own review');
        }

        return this.prisma.review.update({
            where: { id },
            data: dto,
            include: {
                user: {
                    select: { id: true, first_name: true, last_name: true },
                },
            },
        });
    }

    async remove(id: number, userId: string, role: string) {
        const review = await this.findOne(id);

        if (role !== 'admin' && review.id_user !== userId) {
            throw new ForbiddenException('You can only delete your own review');
        }

        return this.prisma.review.delete({ where: { id } });
    }
}