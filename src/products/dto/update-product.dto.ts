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

    @IsString()
    @IsOptional()
    type?: string;

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

    @IsArray()
    @IsOptional()
    @Type(() => Number)
    category_ids?: number[];
}