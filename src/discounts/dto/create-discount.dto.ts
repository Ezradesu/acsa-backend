import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDiscountDto {
    @IsString()
    @IsNotEmpty()
    id_product: string;

    @IsNumber()
    @Type(() => Number)
    price: number;

    @IsNotEmpty()
    start_date: Date;

    @IsNotEmpty()
    end_date: Date;
}