import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBannerDto {
    @IsNumber()
    @Type(() => Number)
    id_brand: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsNotEmpty()
    start_date: Date;

    @IsNotEmpty()
    end_date: Date;
}