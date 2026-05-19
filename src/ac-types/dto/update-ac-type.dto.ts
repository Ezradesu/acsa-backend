import { IsOptional, IsString } from 'class-validator';

export class UpdateAcTypeDto {
    @IsString()
    @IsOptional()
    name?: string;
}
