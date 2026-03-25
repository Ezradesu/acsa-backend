import {
    Controller, Get, Post, Put, Delete,
    Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { SponsoredBrandsService } from './sponsored-brands.service';
import { CreateSponsoredBrandDto } from './dto/create-sponsored-brand.dto';
import { UpdateSponsoredBrandDto } from './dto/update-sponsored-brand.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@Controller('sponsored-brands')
export class SponsoredBrandsController {
    constructor(private sponsoredBrandsService: SponsoredBrandsService) { }

    @Get()
    findAll() {
        return this.sponsoredBrandsService.findAll();
    }

    @Get('active')
    findActive() {
        return this.sponsoredBrandsService.findActive();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.sponsoredBrandsService.findOne(id);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Post()
    create(@Body() dto: CreateSponsoredBrandDto) {
        return this.sponsoredBrandsService.create(dto);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateSponsoredBrandDto,
    ) {
        return this.sponsoredBrandsService.update(id, dto);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.sponsoredBrandsService.remove(id);
    }
}