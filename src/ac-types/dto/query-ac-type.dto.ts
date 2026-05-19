import { IsOptional, IsString } from 'class-validator';

export class QueryAcTypeDto {
    @IsOptional()
    @IsString()
    search?: string;
}
