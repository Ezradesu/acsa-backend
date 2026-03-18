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

@UseGuards(JwtGuard)
@Controller('orders')
export class OrdersController {
    constructor(private ordersService: OrdersService) { }

    @Get()
    findAll(@GetUser('id') userId: string, @GetUser('role') role: string) {
        return this.ordersService.findAll(userId, role);
    }

    @Get(':id')
    findOne(
        @Param('id') id: string,
        @GetUser('id') userId: string,
        @GetUser('role') role: string,
    ) {
        return this.ordersService.findOne(id, userId, role);
    }

    @Post()
    create(@GetUser('id') userId: string, @Body() dto: CreateOrderDto) {
        return this.ordersService.create(userId, dto);
    }

    @UseGuards(RolesGuard)
    @Roles('admin')
    @Put(':id/status')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
        return this.ordersService.updateStatus(id, dto);
    }

    @Delete(':id/cancel')
    cancel(
        @Param('id') id: string,
        @GetUser('id') userId: string,
        @GetUser('role') role: string,
    ) {
        return this.ordersService.cancel(id, userId, role);
    }
}