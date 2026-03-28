import { IsOptional, IsString } from 'class-validator';

export class UpdateStaffDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    role?: string;
}