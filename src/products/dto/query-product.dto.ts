import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsIn,
  Max,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(Number);
    }
    if (!Array.isArray(value)) {
      return [Number(value)];
    }
    return value.map(Number);
  })
  @IsArray()
  @IsNumber({}, { each: true })
  id_brand?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!Array.isArray(value)) {
      return [Number(value)];
    }
    return value.map(Number);
  })
  @IsArray()
  @IsNumber({}, { each: true })
  id_category?: number[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  id_ac_type?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeleted?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  min_price?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  max_price?: number;

  @IsOptional()
  @IsString()
  @IsIn(['price', 'date'])
  sortBy?: 'price' | 'date';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  freon_type?: string;

  @IsOptional()
  @IsString()
  model_code?: string;

  @IsOptional()
  @IsString()
  series_name?: string;
}
