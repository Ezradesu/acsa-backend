import {
    Controller, Get, Put, Post,
    Body, UseGuards,
    UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@Controller('company')
export class CompanyController {
    constructor(private companyService: CompanyService) { }

    @Get()
    get() {
        return this.companyService.get();
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Put()
    update(@Body() dto: UpdateCompanyDto) {
        return this.companyService.update(dto);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Post('logo')
    @UseInterceptors(FileInterceptor('file'))
    uploadLogo(@UploadedFile() file: Express.Multer.File) {
        return this.companyService.uploadLogo(file);
    }
}