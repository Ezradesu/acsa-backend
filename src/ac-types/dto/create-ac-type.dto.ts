import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAcTypeDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}
