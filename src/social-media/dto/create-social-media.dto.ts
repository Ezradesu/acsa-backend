import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSocialMediaDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsString()
    @IsNotEmpty()
    url: string;
}