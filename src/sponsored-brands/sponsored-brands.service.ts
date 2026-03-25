import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSponsoredBrandDto } from './dto/create-sponsored-brand.dto';
import { UpdateSponsoredBrandDto } from './dto/update-sponsored-brand.dto';

@Injectable()
export class SponsoredBrandsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.sponsoredBrand.findMany({
            include: { brand: true },
            orderBy: { priority: 'asc' },
        });
    }

    async findActive() {
        const now = new Date();
        return this.prisma.sponsoredBrand.findMany({
            where: {
                start_date: { lte: now },
                end_date: { gte: now },
            },
            include: { brand: true },
            orderBy: { priority: 'asc' },
        });
    }

    async findOne(id: number) {
        const sponsored = await this.prisma.sponsoredBrand.findUnique({
            where: { id },
            include: { brand: true },
        });
        if (!sponsored) throw new NotFoundException('Sponsored brand not found');
        return sponsored;
    }

    async create(dto: CreateSponsoredBrandDto) {
        const brand = await this.prisma.brand.findUnique({
            where: { id: dto.id_brand },
        });
        if (!brand) throw new NotFoundException('Brand not found');

        if (new Date(dto.start_date) >= new Date(dto.end_date)) {
            throw new BadRequestException('start_date must be before end_date');
        }

        return this.prisma.sponsoredBrand.create({
            data: {
                id_brand: dto.id_brand,
                priority: dto.priority,
                start_date: new Date(dto.start_date),
                end_date: new Date(dto.end_date),
            },
            include: { brand: true },
        });
    }

    async update(id: number, dto: UpdateSponsoredBrandDto) {
        const sponsored = await this.findOne(id);

        const start = dto.start_date ? new Date(dto.start_date) : sponsored.start_date;
        const end = dto.end_date ? new Date(dto.end_date) : sponsored.end_date;

        if (start >= end) {
            throw new BadRequestException('start_date must be before end_date');
        }

        return this.prisma.sponsoredBrand.update({
            where: { id },
            data: { ...dto, start_date: start, end_date: end },
            include: { brand: true },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.sponsoredBrand.delete({ where: { id } });
    }
}