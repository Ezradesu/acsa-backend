import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStaffDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    role?: string;
}