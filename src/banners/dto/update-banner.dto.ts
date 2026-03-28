import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBannerDto {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    id_brand?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsOptional()
    start_date?: Date;

    @IsOptional()
    end_date?: Date;
}