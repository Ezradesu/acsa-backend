import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCartItemDto {
    @IsString()
    @IsNotEmpty()
    id_product: string;

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    quantity: number;
}