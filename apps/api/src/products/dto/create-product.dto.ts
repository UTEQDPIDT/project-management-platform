import { CoAuthor } from '@repo/types';
import {
  IsString,
  IsOptional,
  IsMongoId,
  IsEnum,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  subcategory: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  details?: string;

  @IsEnum(CoAuthor)
  @IsOptional()
  coAuthor?: CoAuthor;

  @IsOptional()
  @IsMongoId({ each: true })
  files?: string[];
}
