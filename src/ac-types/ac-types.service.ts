import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcTypeDto } from './dto/create-ac-type.dto';
import { UpdateAcTypeDto } from './dto/update-ac-type.dto';
import { QueryAcTypeDto } from './dto/query-ac-type.dto';
import { CatalogCacheService } from '../cache/catalog-cache.service';
import { Prisma } from '../../prisma/@prisma/client/client';

@Injectable()
export class AcTypesService {
  constructor(
    private prisma: PrismaService,
    private cache: CatalogCacheService,
  ) {}

  async create(dto: CreateAcTypeDto) {
    const existing = await this.prisma.acType.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('AC Type already exists');
    const acType = await this.prisma.acType.create({ data: dto });
    await this.cache.invalidateCatalog();
    return acType;
  }

  async findAll(query: QueryAcTypeDto = {}) {
    const where: Prisma.AcTypeWhereInput = {};

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const productsCountWhere: Prisma.ProductWhereInput = query.includeDeleted
      ? {}
      : { is_deleted: false };

    return this.prisma.acType.findMany({
      where,
      include: {
        _count: {
          select: {
            products: { where: productsCountWhere },
          },
        },
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
    const acType = await this.prisma.acType.update({
      where: { id },
      data: dto,
    });
    await this.cache.invalidateCatalog();
    return acType;
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      const acType = await this.prisma.acType.delete({ where: { id } });
      await this.cache.invalidateCatalog();
      return acType;
    } catch {
      throw new ConflictException('Cannot delete AC Type because it is in use');
    }
  }
}
