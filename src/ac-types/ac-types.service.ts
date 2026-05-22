import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcTypeDto } from './dto/create-ac-type.dto';
import { UpdateAcTypeDto } from './dto/update-ac-type.dto';
import { QueryAcTypeDto } from './dto/query-ac-type.dto';

@Injectable()
export class AcTypesService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateAcTypeDto) {
    const existing = await this.prisma.acType.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('AC Type already exists');
    return this.prisma.acType.create({ data: dto });
  }

  async findAll(query: QueryAcTypeDto = {}) {
    const where: any = {};

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const productsCountWhere = query.includeDeleted ? {} : { is_deleted: false };

    return this.prisma.acType.findMany({
      where,
      include: { 
        _count: { 
          select: { 
            products: { where: productsCountWhere } 
          } 
        } 
      },
    });
  }

  async findOne(id: number) {
    const acType = await this.prisma.acType.findUnique({ where: { id } });
    if (!acType) throw new NotFoundException('AC Type not found');
    return acType;
  }

  async update(id: number, dto: UpdateAcTypeDto) {
    await this.findOne(id);
    if (dto.name) {
      const existing = await this.prisma.acType.findUnique({
        where: { name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('AC Type name already exists');
      }
    }
    return this.prisma.acType.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.acType.delete({ where: { id } });
    } catch (error) {
      throw new ConflictException('Cannot delete AC Type because it is in use');
    }
  }
}
