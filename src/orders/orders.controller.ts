import {
    Controller, Get, Post, Put, Delete,
    Body, Param, UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('orders')
export class OrdersController {
    constructor(private ordersService: OrdersService) { }

    @UseGuards(JwtGuard)
    @Get()
    findAll(@GetUser('id') userId: string, @GetUser('role') role: string) {
        return this.ordersService.findAll(userId, role);
    }

    @UseGuards(JwtGuard)
    @Get(':id')
    findOne(
        @Param('id') id: string,
        @GetUser('id') userId: string,
        @GetUser('role') role: string,
    ) {
        return this.ordersService.findOne(id, userId, role);
    }

    @UseGuards(JwtGuard)
    @Post()
    create(@GetUser('id') userId: string, @Body() dto: CreateOrderDto) {
        return this.ordersService.create(userId, dto);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Put(':id/status')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
        return this.ordersService.updateStatus(id, dto);
    }

    @UseGuards(JwtGuard)
    @Delete(':id/cancel')
    cancel(
        @Param('id') id: string,
        @GetUser('id') userId: string,
        @GetUser('role') role: string,
    ) {
        return this.ordersService.cancel(id, userId, role);
    }

    @Post('payment/webhook')
    handleWebhook(@Body() notification: any) {
        return this.ordersService.handleWebhook(notification);
    }
}