import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSponsoredBrandDto {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    priority?: number;

    @IsOptional()
    start_date?: Date;

    @IsOptional()
    end_date?: Date;
}