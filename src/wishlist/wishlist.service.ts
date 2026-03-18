import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';

@Injectable()
export class WishlistService {
    constructor(private prisma: PrismaService) { }

    private async getOrCreateWishlist(userId: string) {
        let wishlist = await this.prisma.wishlist.findFirst({
            where: { id_user: userId },
        });

        if (!wishlist) {
            wishlist = await this.prisma.wishlist.create({
                data: { id_user: userId },
            });
        }

        return wishlist;
    }

    async getWishlist(userId: string) {
        const wishlist = await this.getOrCreateWishlist(userId);
        return this.prisma.wishlist.findUnique({
            where: { id: wishlist.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: { images: true, discounts: true, brand: true },
                        },
                    },
                },
            },
        });
    }

    async addItem(userId: string, dto: AddWishlistItemDto) {
        const wishlist = await this.getOrCreateWishlist(userId);

        const product = await this.prisma.product.findUnique({
            where: { id: dto.id_product },
        });
        if (!product) throw new NotFoundException('Product not found');

        const existing = await this.prisma.wishlistItem.findFirst({
            where: { id_wishlist: wishlist.id, id_product: dto.id_product },
        });
        if (existing) throw new ConflictException('Product already in wishlist');

        return this.prisma.wishlistItem.create({
            data: {
                id_wishlist: wishlist.id,
                id_product: dto.id_product,
            },
            include: { product: { include: { images: true } } },
        });
    }

    async removeItem(userId: string, itemId: number) {
        const wishlist = await this.getOrCreateWishlist(userId);

        const item = await this.prisma.wishlistItem.findFirst({
            where: { id: itemId, id_wishlist: wishlist.id },
        });
        if (!item) throw new NotFoundException('Wishlist item not found');

        return this.prisma.wishlistItem.delete({ where: { id: itemId } });
    }
}