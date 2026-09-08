import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AcTypesService } from './ac-types.service';
import { CreateAcTypeDto } from './dto/create-ac-type.dto';
import { UpdateAcTypeDto } from './dto/update-ac-type.dto';
import { QueryAcTypeDto } from './dto/query-ac-type.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@Controller('ac-types')
export class AcTypesController {
  constructor(private readonly acTypesService: AcTypesService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createAcTypeDto: CreateAcTypeDto) {
    return this.acTypesService.create(createAcTypeDto);
  }

  @Get()
  findAll(@Query() query: QueryAcTypeDto) {
    return this.acTypesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.acTypesService.findOne(+id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAcTypeDto: UpdateAcTypeDto) {
    return this.acTypesService.update(+id, updateAcTypeDto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.acTypesService.remove(+id);
  }
}
