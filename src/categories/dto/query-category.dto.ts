import {
    IsOptional,
    IsString,
    IsBoolean,
    IsArray,
    IsNumber,
} from 'class-validator';

import { Transform, Type } from 'class-transformer';

export class QueryCategoryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    includeDeleted?: boolean;

    @IsOptional()
    @Transform(({ value }) => {
        // kalau cuma 1 value
        if (!Array.isArray(value)) {
            return [Number(value)];
        }

        // kalau multiple value
        return value.map(Number);
    })
    @Type(() => Number)
    @IsArray()
    @IsNumber({}, { each: true })
    id_category?: number[];
}