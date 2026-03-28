import { IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    category?: string;
}