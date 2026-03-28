import { IsOptional, IsString } from 'class-validator';

export class UpdateSocialMediaDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsString()
    @IsOptional()
    url?: string;
}