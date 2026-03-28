import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
    constructor(
        private prisma: PrismaService,
        private supabase: SupabaseService,
    ) { }

    async findAll() {
        return this.prisma.banner.findMany({
            include: { brand: true },
            orderBy: { start_date: 'desc' },
        });
    }

    async findActive() {
        const now = new Date();
        return this.prisma.banner.findMany({
            where: {
                start_date: { lte: now },
                end_date: { gte: now },
            },
            include: { brand: true },
            orderBy: { start_date: 'asc' },
        });
    }

    async findOne(id: number) {
        const banner = await this.prisma.banner.findUnique({
            where: { id },
            include: { brand: true },
        });
        if (!banner) throw new NotFoundException('Banner not found');
        return banner;
    }

    async create(dto: CreateBannerDto) {
        const brand = await this.prisma.brand.findUnique({
            where: { id: dto.id_brand },
        });
        if (!brand) throw new NotFoundException('Brand not found');

        if (new Date(dto.start_date) >= new Date(dto.end_date)) {
            throw new BadRequestException('start_date must be before end_date');
        }

        return this.prisma.banner.create({
            data: {
                id_brand: dto.id_brand,
                name: dto.name,
                category: dto.category,
                start_date: new Date(dto.start_date),
                end_date: new Date(dto.end_date),
            },
            include: { brand: true },
        });
    }

    async update(id: number, dto: UpdateBannerDto) {
        const banner = await this.findOne(id);

        if (dto.id_brand) {
            const brand = await this.prisma.brand.findUnique({
                where: { id: dto.id_brand },
            });
            if (!brand) throw new NotFoundException('Brand not found');
        }

        const start = dto.start_date ? new Date(dto.start_date) : banner.start_date;
        const end = dto.end_date ? new Date(dto.end_date) : banner.end_date;

        if (start >= end) {
            throw new BadRequestException('start_date must be before end_date');
        }

        return this.prisma.banner.update({
            where: { id },
            data: { ...dto, start_date: start, end_date: end },
            include: { brand: true },
        });
    }

    async remove(id: number) {
        const banner = await this.findOne(id);

        if (banner.image_url) {
            const path = new URL(banner.image_url).pathname.split('/').slice(-2).join('/');
            await this.supabase.deleteFile(process.env.SUPABASE_STORAGE_BUCKET!, path);
        }

        return this.prisma.banner.delete({ where: { id } });
    }

    async uploadImage(id: number, file: Express.Multer.File) {
        await this.findOne(id);
        const path = `banners/${id}-${Date.now()}`;
        const url = await this.supabase.uploadFile(
            process.env.SUPABASE_STORAGE_BUCKET!,
            path,
            file,
        );
        return this.prisma.banner.update({
            where: { id },
            data: { image_url: url },
            include: { brand: true },
        });
    }
}