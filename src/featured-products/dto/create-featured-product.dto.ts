import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFeaturedProductDto {
    @IsString()
    @IsNotEmpty()
    id_product: string;

    @IsNumber()
    @Type(() => Number)
    priority: number;

    @IsNotEmpty()
    start_date: Date;

    @IsNotEmpty()
    end_date: Date;
}