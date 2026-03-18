import {
    Controller, Get, Post, Put, Delete,
    Body, Param, Query, UseGuards,
    UseInterceptors, UploadedFiles,
    ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@Controller('products')
export class ProductsController {
    constructor(private productsService: ProductsService) { }

    @Get()
    findAll(@Query() query: QueryProductDto) {
        return this.productsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Post()
    create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, dto);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Post(':id/images')
    @UseInterceptors(FilesInterceptor('files', 10))
    uploadImages(
        @Param('id') id: string,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.productsService.uploadImages(id, files);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id/images/:imageId')
    deleteImage(
        @Param('id') id: string,
        @Param('imageId', ParseIntPipe) imageId: number,
    ) {
        return this.productsService.deleteImage(id, imageId);
    }
}