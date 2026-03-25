import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeaturedProductDto } from './dto/create-featured-product.dto';
import { UpdateFeaturedProductDto } from './dto/update-featured-product.dto';

@Injectable()
export class FeaturedProductsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.featuredProduct.findMany({
            include: {
                product: { include: { images: true, brand: true, discounts: true } },
            },
            orderBy: { priority: 'asc' },
        });
    }

    async findActive() {
        const now = new Date();
        return this.prisma.featuredProduct.findMany({
            where: {
                start_date: { lte: now },
                end_date: { gte: now },
            },
            include: {
                product: { include: { images: true, brand: true, discounts: true } },
            },
            orderBy: { priority: 'asc' },
        });
    }

    async findOne(id: number) {
        const featured = await this.prisma.featuredProduct.findUnique({
            where: { id },
            include: { product: true },
        });
        if (!featured) throw new NotFoundException('Featured product not found');
        return featured;
    }

    async create(dto: CreateFeaturedProductDto) {
        const product = await this.prisma.product.findUnique({
            where: { id: dto.id_product },
        });
        if (!product) throw new NotFoundException('Product not found');

        if (new Date(dto.start_date) >= new Date(dto.end_date)) {
            throw new BadRequestException('start_date must be before end_date');
        }

        return this.prisma.featuredProduct.create({
            data: {
                id_product: dto.id_product,
                priority: dto.priority,
                start_date: new Date(dto.start_date),
                end_date: new Date(dto.end_date),
            },
            include: { product: true },
        });
    }

    async update(id: number, dto: UpdateFeaturedProductDto) {
        const featured = await this.findOne(id);

        const start = dto.start_date ? new Date(dto.start_date) : featured.start_date;
        const end = dto.end_date ? new Date(dto.end_date) : featured.end_date;

        if (start >= end) {
            throw new BadRequestException('start_date must be before end_date');
        }

        return this.prisma.featuredProduct.update({
            where: { id },
            data: { ...dto, start_date: start, end_date: end },
            include: { product: true },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.featuredProduct.delete({ where: { id } });
    }
}