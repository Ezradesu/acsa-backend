import { IsOptional, IsString, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryProductDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    id_brand?: number;

    @IsOptional()
    @Transform(({ value }) => {
        if (!Array.isArray(value)) {
            return [Number(value)];
        }
        return value.map(Number);
    })
    @IsArray()
    @IsNumber({}, { each: true })
    id_category?: number[];

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    includeDeleted?: boolean;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    min_price?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    max_price?: number;

    @IsOptional()
    @IsString()
    sortBy?: 'price' | 'date';

    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc';
}