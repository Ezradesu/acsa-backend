import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { CatalogCacheService } from '../cache/catalog-cache.service';

@Injectable()
export class DiscountsService {
  constructor(
    private prisma: PrismaService,
    private cache: CatalogCacheService,
  ) {}

  async findAll() {
    return this.prisma.discount.findMany({
      include: {
        product: { include: { images: true } },
      },
      orderBy: { start_date: 'desc' },
    });
  }

  async findActive() {
    const now = new Date();
    return this.prisma.discount.findMany({
      where: {
        start_date: { lte: now },
        end_date: { gte: now },
      },
      include: {
        product: { include: { images: true } },
      },
    });
  }

  async findOne(id: number) {
    const discount = await this.prisma.discount.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!discount) throw new NotFoundException('Discount not found');
    return discount;
  }

  async create(dto: CreateDiscountDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.id_product },
    });
    if (!product) throw new NotFoundException('Product not found');

    if (new Date(dto.start_date) >= new Date(dto.end_date)) {
      throw new BadRequestException('start_date must be before end_date');
    }

    if (dto.price >= Number(product.price)) {
      throw new BadRequestException(
        'Discount price must be less than original price',
      );
    }

    const discount = await this.prisma.discount.create({
      data: {
        id_product: dto.id_product,
        price: dto.price,
        start_date: new Date(dto.start_date),
        end_date: new Date(dto.end_date),
      },
      include: { product: true },
    });
    await this.cache.invalidateCatalog();
    return discount;
  }

  async update(id: number, dto: UpdateDiscountDto) {
    const discount = await this.findOne(id);

    const start = dto.start_date
      ? new Date(dto.start_date)
      : discount.start_date;
    const end = dto.end_date ? new Date(dto.end_date) : discount.end_date;

    if (start >= end) {
      throw new BadRequestException('start_date must be before end_date');
    }

    const updated = await this.prisma.discount.update({
      where: { id },
      data: {
        ...dto,
        start_date: start,
        end_date: end,
      },
      include: { product: true },
    });
    await this.cache.invalidateCatalog();
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    const discount = await this.prisma.discount.delete({ where: { id } });
    await this.cache.invalidateCatalog();
    return discount;
  }
}
