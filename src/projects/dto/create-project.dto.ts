import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';

export class CreateProjectDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsNotEmpty()
  id_products: string[];

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  date?: Date;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  category?: string;
}
