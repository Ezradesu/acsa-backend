import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) { }

    private async getOrCreateCart(userId: string) {
        let cart = await this.prisma.cart.findFirst({
            where: { id_user: userId },
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { id_user: userId },
            });
        }

        return cart;
    }

    async getCart(userId: string) {
        const cart = await this.getOrCreateCart(userId);
        return this.prisma.cart.findUnique({
            where: { id: cart.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: { images: true, discounts: true },
                        },
                    },
                },
            },
        });
    }

    async addItem(userId: string, dto: AddCartItemDto) {
        const cart = await this.getOrCreateCart(userId);

        // Cek product ada
        const product = await this.prisma.product.findUnique({
            where: { id: dto.id_product },
        });
        if (!product) throw new NotFoundException('Product not found');
        if (product.quantity < dto.quantity) {
            throw new BadRequestException('Insufficient stock');
        }

        // Cek apakah item sudah ada di cart
        const existingItem = await this.prisma.cartItem.findFirst({
            where: { id_cart: cart.id, id_product: dto.id_product },
        });

        if (existingItem) {
            return this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + dto.quantity },
                include: { product: { include: { images: true } } },
            });
        }

        return this.prisma.cartItem.create({
            data: {
                id_cart: cart.id,
                id_product: dto.id_product,
                quantity: dto.quantity,
            },
            include: { product: { include: { images: true } } },
        });
    }

    async updateItem(userId: string, itemId: number, dto: UpdateCartItemDto) {
        const cart = await this.getOrCreateCart(userId);

        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, id_cart: cart.id },
        });
        if (!item) throw new NotFoundException('Cart item not found');

        const product = await this.prisma.product.findUnique({
            where: { id: item.id_product },
        });
        if (product!.quantity < dto.quantity) {
            throw new BadRequestException('Insufficient stock');
        }

        return this.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: dto.quantity },
            include: { product: { include: { images: true } } },
        });
    }

    async removeItem(userId: string, itemId: number) {
        const cart = await this.getOrCreateCart(userId);

        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, id_cart: cart.id },
        });
        if (!item) throw new NotFoundException('Cart item not found');

        return this.prisma.cartItem.delete({ where: { id: itemId } });
    }

    async clearCart(userId: string) {
        const cart = await this.getOrCreateCart(userId);
        return this.prisma.cartItem.deleteMany({ where: { id_cart: cart.id } });
    }
}