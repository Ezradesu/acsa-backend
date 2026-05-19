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

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    id_ac_type?: number;

    @IsNumber()
    @Type(() => Number)
    price: number;

    @IsNumber()
    @Type(() => Number)
    quantity: number;

    @IsString()
    @IsOptional()
    pk?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    id_category?: number;
}