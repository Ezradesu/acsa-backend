import { IsOptional, IsString } from 'class-validator';

export class UpdateCompanyDto {
    @IsString()
    @IsOptional()
    logo_url?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    location_url?: string;
}