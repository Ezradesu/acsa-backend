import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    id_brand?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    id_ac_type?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    price?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    quantity?: number;

    @IsString()
    @IsOptional()
    pk?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    id_category?: number;

    @IsString()
    @IsOptional()
    freon_type?: string;

    @IsString()
    @IsOptional()
    model_code?: string;

    @IsString()
    @IsOptional()
    series_name?: string;
}