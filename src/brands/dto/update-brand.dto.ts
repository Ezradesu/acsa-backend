import { IsOptional, IsString } from 'class-validator';

export class UpdateBrandDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    image_url?: string;
}