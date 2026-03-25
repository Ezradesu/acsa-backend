import {
    Controller, Get, Post, Put, Delete,
    Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('products/:productId/reviews')
export class ReviewsController {
    constructor(private reviewsService: ReviewsService) { }

    @Get()
    findByProduct(@Param('productId') productId: string) {
        return this.reviewsService.findByProduct(productId);
    }

    @UseGuards(JwtGuard)
    @Post()
    create(
        @Param('productId') productId: string,
        @GetUser('id') userId: string,
        @Body() dto: CreateReviewDto,
    ) {
        return this.reviewsService.create(userId, productId, dto);
    }

    @UseGuards(JwtGuard)
    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @GetUser('id') userId: string,
        @GetUser('role') role: string,
        @Body() dto: UpdateReviewDto,
    ) {
        return this.reviewsService.update(id, userId, role, dto);
    }

    @UseGuards(JwtGuard)
    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser('id') userId: string,
        @GetUser('role') role: string,
    ) {
        return this.reviewsService.remove(id, userId, role);
    }
}