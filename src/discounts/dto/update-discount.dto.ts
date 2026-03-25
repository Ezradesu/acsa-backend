import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDiscountDto {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    price?: number;

    @IsOptional()
    start_date?: Date;

    @IsOptional()
    end_date?: Date;
}