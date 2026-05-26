import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsOptional()
  id_products?: string[];

  @IsString()
  @IsOptional()
  name?: string;

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
