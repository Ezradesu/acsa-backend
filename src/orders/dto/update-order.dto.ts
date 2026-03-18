import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    status: string;
}