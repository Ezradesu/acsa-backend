import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { SupabaseService } from '../supabase/supabase.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class BrandsService {
    constructor(
        private prisma: PrismaService,
        private supabase: SupabaseService,
    ) { }

    async findAll(query: QueryBrandDto = {}) {
        const where: any = {};

        if (query.search) {
            where.name = { contains: query.search, mode: 'insensitive' };
        }

        if (!query.includeDeleted) {
            where.is_deleted = false;
        }

        return this.prisma.brand.findMany({
            where,
            include: { _count: { select: { products: true } } },
        });
    }

    async findOne(id: number) {
        const brand = await this.prisma.brand.findUnique({ where: { id } });
        if (!brand || brand.is_deleted) throw new NotFoundException('Brand not found');
        return brand;
    }

    async create(dto: CreateBrandDto) {
        return this.prisma.brand.create({ data: dto });
    }

    async update(id: number, dto: UpdateBrandDto) {
        await this.findOne(id);
        return this.prisma.brand.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.brand.update({
            where: { id },
            data: { is_deleted: true },
        });
    }

    async uploadImage(id: number, file: Express.Multer.File) {
        await this.findOne(id);
        const path = `brands/${id}-${Date.now()}`;
        const url = await this.supabase.uploadFile(
            process.env.SUPABASE_STORAGE_BUCKET!,
            path,
            file,
        );
        return this.prisma.brand.update({
            where: { id },
            data: { image_url: url },
        });
    }
}