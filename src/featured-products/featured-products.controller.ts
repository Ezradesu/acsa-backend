import {
    Controller, Get, Post, Put, Delete,
    Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { FeaturedProductsService } from './featured-products.service';
import { CreateFeaturedProductDto } from './dto/create-featured-product.dto';
import { UpdateFeaturedProductDto } from './dto/update-featured-product.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@Controller('featured-products')
export class FeaturedProductsController {
    constructor(private featuredProductsService: FeaturedProductsService) { }

    @Get()
    findAll() {
        return this.featuredProductsService.findAll();
    }

    @Get('active')
    findActive() {
        return this.featuredProductsService.findActive();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.featuredProductsService.findOne(id);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Post()
    create(@Body() dto: CreateFeaturedProductDto) {
        return this.featuredProductsService.create(dto);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateFeaturedProductDto,
    ) {
        return this.featuredProductsService.update(id, dto);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.featuredProductsService.remove(id);
    }
}