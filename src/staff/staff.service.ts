import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
    constructor(
        private prisma: PrismaService,
        private supabase: SupabaseService,
    ) { }

    async findAll() {
        return this.prisma.staff.findMany({
            orderBy: { id: 'asc' },
        });
    }

    async findOne(id: number) {
        const staff = await this.prisma.staff.findUnique({ where: { id } });
        if (!staff) throw new NotFoundException('Staff not found');
        return staff;
    }

    async create(dto: CreateStaffDto) {
        return this.prisma.staff.create({ data: dto });
    }

    async update(id: number, dto: UpdateStaffDto) {
        await this.findOne(id);
        return this.prisma.staff.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        const staff = await this.findOne(id);

        // Hapus foto dari storage jika ada
        if (staff.image_url) {
            const path = new URL(staff.image_url).pathname.split('/').slice(-2).join('/');
            await this.supabase.deleteFile(process.env.SUPABASE_STORAGE_BUCKET!, path);
        }

        return this.prisma.staff.delete({ where: { id } });
    }

    async uploadImage(id: number, file: Express.Multer.File) {
        const staff = await this.findOne(id);

        // Hapus foto lama jika ada
        if (staff.image_url) {
            const path = new URL(staff.image_url).pathname.split('/').slice(-2).join('/');
            await this.supabase.deleteFile(process.env.SUPABASE_STORAGE_BUCKET!, path);
        }

        const path = `staff/${id}-${Date.now()}`;
        const url = await this.supabase.uploadFile(
            process.env.SUPABASE_STORAGE_BUCKET!,
            path,
            file,
        );

        return this.prisma.staff.update({
            where: { id },
            data: { image_url: url },
        });
    }
}