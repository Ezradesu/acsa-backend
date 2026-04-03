import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { MidtransService } from '../midtrans/midtrans.service';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private midtransService: MidtransService,
    ) { }

    async findAll(userId: string, role: string) {
        const where = role === 'admin' ? {} : { id_user: userId };
        return this.prisma.order.findMany({
            where,
            include: {
                user: {
                    select: { id: true, first_name: true, last_name: true, email: true },
                },
                items: {
                    include: {
                        product: { include: { images: true } },
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    async findOne(id: string, userId: string, role: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, first_name: true, last_name: true, email: true },
                },
                items: {
                    include: {
                        product: { include: { images: true } },
                    },
                },
            },
        });

        if (!order) throw new NotFoundException('Order not found');
        if (role !== 'admin' && order.id_user !== userId) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    async create(userId: string, dto: CreateOrderDto) {
        // Ambil semua product sekaligus
        const products = await this.prisma.product.findMany({
            where: { id: { in: dto.items.map((i) => i.id_product) } },
        });

        // Validasi semua product ada dan stok cukup
        for (const item of dto.items) {
            const product = products.find((p) => p.id === item.id_product);
            if (!product) {
                throw new NotFoundException(`Product ${item.id_product} not found`);
            }
            if (product.quantity < item.quantity) {
                throw new BadRequestException(
                    `Insufficient stock for product ${product.name}`,
                );
            }
        }

        // Hitung total
        const total = dto.items.reduce((sum, item) => {
            const product = products.find((p) => p.id === item.id_product)!;
            return sum + Number(product.price) * item.quantity;
        }, 0);

        // Buat order + kurangi stok dalam satu transaction
        const order = await this.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    id_user: userId,
                    total,
                    status: 'pending',
                    items: {
                        create: dto.items.map((item) => {
                            const product = products.find((p) => p.id === item.id_product)!;
                            return {
                                id_product: item.id_product,
                                quantity: item.quantity,
                                price: product.price,
                                date: new Date(),
                            };
                        }),
                    },
                },
                include: {
                    items: {
                        include: { product: true },
                    },
                },
            });

            // Kurangi stok
            await Promise.all(
                dto.items.map((item) =>
                    tx.product.update({
                        where: { id: item.id_product },
                        data: { quantity: { decrement: item.quantity } },
                    }),
                ),
            );

            return newOrder;
        });

        // Ambil data user untuk payload Midtrans
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        // Generate Midtrans Snap Token
        try {
            const snapTransaction = await this.midtransService.createSnapTransaction(
                order,
                user,
            );

            // Update order dengan token
            return this.prisma.order.update({
                where: { id: order.id },
                data: {
                    snap_token: snapTransaction.token,
                    snap_redirect: snapTransaction.redirect_url,
                },
                include: {
                    items: {
                        include: { product: true },
                    },
                },
            });
        } catch (error) {
            // Tetap return order meskipun Midtrans gagal (user bisa coba lagi nanti)
            return order;
        }
    }

    async handleWebhook(notification: any) {
        const isValid = this.midtransService.verifySignatureKey(notification);
        if (!isValid) {
            throw new BadRequestException('Invalid signature key');
        }

        const { order_id, transaction_status, fraud_status } = notification;

        let status = 'pending';

        if (transaction_status === 'capture') {
            if (fraud_status === 'challenge') {
                status = 'challenge';
            } else if (fraud_status === 'accept') {
                status = 'settlement';
            }
        } else if (transaction_status === 'settlement') {
            status = 'settlement';
        } else if (
            transaction_status === 'cancel' ||
            transaction_status === 'deny' ||
            transaction_status === 'expire'
        ) {
            status = 'failure';
        } else if (transaction_status === 'pending') {
            status = 'pending';
        }

        // Jika status failure, kembalikan stok
        if (status === 'failure') {
            const order = await this.prisma.order.findUnique({
                where: { id: order_id },
                include: { items: true },
            });

            if (order && order.status !== 'failure') {
                await this.prisma.$transaction(async (tx) => {
                    await Promise.all(
                        order.items.map((item) =>
                            tx.product.update({
                                where: { id: item.id_product },
                                data: { quantity: { increment: item.quantity } },
                            }),
                        ),
                    );

                    await tx.order.update({
                        where: { id: order_id },
                        data: { status },
                    });
                });
                return { status: 'ok' };
            }
        }

        return this.prisma.order.update({
            where: { id: order_id },
            data: { status },
        });
    }

    async updateStatus(id: string, dto: UpdateOrderStatusDto) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) throw new NotFoundException('Order not found');

        return this.prisma.order.update({
            where: { id },
            data: { status: dto.status },
        });
    }

    async cancel(id: string, userId: string, role: string) {
        const order = await this.findOne(id, userId, role);

        if (order.status !== 'pending') {
            throw new BadRequestException('Only pending orders can be cancelled');
        }

        // Kembalikan stok dalam transaction
        return this.prisma.$transaction(async (tx) => {
            await Promise.all(
                order.items.map((item) =>
                    tx.product.update({
                        where: { id: item.id_product },
                        data: { quantity: { increment: item.quantity } },
                    }),
                ),
            );

            return tx.order.update({
                where: { id },
                data: { status: 'cancelled' },
            });
        });
    }
}