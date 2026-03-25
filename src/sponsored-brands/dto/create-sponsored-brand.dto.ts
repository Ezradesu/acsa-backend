import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSponsoredBrandDto {
    @IsNumber()
    @Type(() => Number)
    id_brand: number;

    @IsNumber()
    @Type(() => Number)
    priority: number;

    @IsNotEmpty()
    start_date: Date;

    @IsNotEmpty()
    end_date: Date;
}