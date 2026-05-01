import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: QueryCategoryDto = {}) {
        const where: any = {};

        if (query.search) {
            where.name = { contains: query.search, mode: 'insensitive' };
        }

        if (!query.includeDeleted) {
            where.is_deleted = false;
        }

        return this.prisma.category.findMany({
            where,
            include: { _count: { select: { products: true } } },
        });
    }

    async findOne(id: number) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category || category.is_deleted) throw new NotFoundException('Category not found');
        return category;
    }

    async create(dto: CreateCategoryDto) {
        const existing = await this.prisma.category.findUnique({
            where: { name: dto.name },
        });
        if (existing && !existing.is_deleted) throw new ConflictException('Category already exists');
        return this.prisma.category.create({ data: dto });
    }

    async update(id: number, dto: UpdateCategoryDto) {
        await this.findOne(id);
        return this.prisma.category.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.category.update({
            where: { id },
            data: { is_deleted: true },
        });
    }
}