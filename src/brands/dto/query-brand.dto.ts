import { IsOptional, IsString, IsBoolean, IsArray, IsNumber, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryBrandDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(Number);
        }
        if (!Array.isArray(value)) {
            return [Number(value)];
        }
        return value.map(Number);
    })
    @IsArray()
    @IsNumber({}, { each: true })
    ids?: number[];

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    id_brand?: number;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    includeDeleted?: boolean;
}
