import {
    Controller, Get, Post, Delete,
    Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtGuard)
@Controller('wishlist')
export class WishlistController {
    constructor(private wishlistService: WishlistService) { }

    @Get()
    getWishlist(@GetUser('id') userId: string) {
        return this.wishlistService.getWishlist(userId);
    }

    @Post('items')
    addItem(@GetUser('id') userId: string, @Body() dto: AddWishlistItemDto) {
        return this.wishlistService.addItem(userId, dto);
    }

    @Delete('items/:id')
    removeItem(
        @GetUser('id') userId: string,
        @Param('id', ParseIntPipe) itemId: number,
    ) {
        return this.wishlistService.removeItem(userId, itemId);
    }
}