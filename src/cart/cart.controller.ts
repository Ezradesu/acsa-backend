import {
    Controller, Get, Post, Put, Delete,
    Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtGuard)
@Controller('cart')
export class CartController {
    constructor(private cartService: CartService) { }

    @Get()
    getCart(@GetUser('id') userId: string) {
        return this.cartService.getCart(userId);
    }

    @Post('items')
    addItem(@GetUser('id') userId: string, @Body() dto: AddCartItemDto) {
        return this.cartService.addItem(userId, dto);
    }

    @Put('items/:id')
    updateItem(
        @GetUser('id') userId: string,
        @Param('id', ParseIntPipe) itemId: number,
        @Body() dto: UpdateCartItemDto,
    ) {
        return this.cartService.updateItem(userId, itemId, dto);
    }

    @Delete('items/:id')
    removeItem(
        @GetUser('id') userId: string,
        @Param('id', ParseIntPipe) itemId: number,
    ) {
        return this.cartService.removeItem(userId, itemId);
    }

    @Delete('clear')
    clearCart(@GetUser('id') userId: string) {
        return this.cartService.clearCart(userId);
    }
}