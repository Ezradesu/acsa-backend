import { IsNotEmpty, IsString } from 'class-validator';

export class AddWishlistItemDto {
    @IsString()
    @IsNotEmpty()
    id_product: string;
}