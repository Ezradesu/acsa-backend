import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';

@Injectable()
export class SocialMediaService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.socialMedia.findMany({
            orderBy: { id: 'asc' },
        });
    }

    async findOne(id: number) {
        const socialMedia = await this.prisma.socialMedia.findUnique({
            where: { id },
        });
        if (!socialMedia) throw new NotFoundException('Social media not found');
        return socialMedia;
    }

    async create(dto: CreateSocialMediaDto) {
        return this.prisma.socialMedia.create({ data: dto });
    }

    async update(id: number, dto: UpdateSocialMediaDto) {
        await this.findOne(id);
        return this.prisma.socialMedia.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.socialMedia.delete({ where: { id } });
    }
}