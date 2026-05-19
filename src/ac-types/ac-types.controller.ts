import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AcTypesService } from './ac-types.service';
import { CreateAcTypeDto } from './dto/create-ac-type.dto';
import { UpdateAcTypeDto } from './dto/update-ac-type.dto';
import { QueryAcTypeDto } from './dto/query-ac-type.dto';

@Controller('ac-types')
export class AcTypesController {
  constructor(private readonly acTypesService: AcTypesService) {}

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAcTypeDto: UpdateAcTypeDto) {
    return this.acTypesService.update(+id, updateAcTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.acTypesService.remove(+id);
  }
}
