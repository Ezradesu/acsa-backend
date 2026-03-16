import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    rt?: string;

    @IsString()
    @IsOptional()
    rw?: string;

    @IsString()
    @IsOptional()
    zip_code?: string;
}