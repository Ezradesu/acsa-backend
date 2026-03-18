import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsNumber()
    @Type(() => Number)
    id_brand: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    type?: string;

    @IsNumber()
    @Type(() => Number)
    price: number;

    @IsNumber()
    @Type(() => Number)
    quantity: number;

    @IsString()
    @IsOptional()
    pk?: string;

    @IsArray()
    @IsOptional()
    @Type(() => Number)
    category_ids?: number[];
}