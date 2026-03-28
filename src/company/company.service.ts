import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
    constructor(
        private prisma: PrismaService,
        private supabase: SupabaseService,
    ) { }

    async get() {
        // Company selalu hanya 1 row, ambil yang pertama
        const company = await this.prisma.company.findFirst();

        // Kalau belum ada, buat default
        if (!company) {
            return this.prisma.company.create({
                data: { name: 'My Company' },
            });
        }

        return company;
    }

    async update(dto: UpdateCompanyDto) {
        const company = await this.get();
        return this.prisma.company.update({
            where: { id: company.id },
            data: dto,
        });
    }

    async uploadLogo(file: Express.Multer.File) {
        const company = await this.get();

        // Hapus logo lama jika ada
        if (company.logo_url) {
            const path = new URL(company.logo_url).pathname.split('/').slice(-2).join('/');
            await this.supabase.deleteFile(process.env.SUPABASE_STORAGE_BUCKET!, path);
        }

        const path = `company/logo-${Date.now()}`;
        const url = await this.supabase.uploadFile(
            process.env.SUPABASE_STORAGE_BUCKET!,
            path,
            file,
        );

        return this.prisma.company.update({
            where: { id: company.id },
            data: { logo_url: url },
        });
    }
}