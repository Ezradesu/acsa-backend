import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@Controller('brands')
export class BrandsController {
    constructor(private brandsService: BrandsService) { }

    @Get()
    findAll() {
        return this.brandsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.brandsService.findOne(id);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Post()
    create(@Body() dto: CreateBrandDto) {
        return this.brandsService.create(dto);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrandDto) {
        return this.brandsService.update(id, dto);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.brandsService.remove(id);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Post(':id/image')
    @UseInterceptors(FileInterceptor('file'))
    uploadImage(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.brandsService.uploadImage(id, file);
    }
}