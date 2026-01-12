import { ApiProperty } from '@nestjs/swagger';
import { CoAuthor } from '@repo/types';
import {
  IsString,
  IsOptional,
  IsMongoId,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateProductDto {
  @ApiProperty({ description: 'Nombre del producto' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Categoría a la que pertenece el producto' })
  @IsMongoId()
  category: ObjectId;

  @ApiProperty({ description: 'Subcategoría a la que pertenece el producto' })
  @IsMongoId()
  subcategory: ObjectId;

  @ApiProperty({
    description: 'Detalles del producto como especifica la documentación',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  details?: string;

  @ApiProperty({
    description: 'Nivel del Co-Autor',
  })
  @IsEnum(CoAuthor)
  @IsOptional()
  coAuthor?: CoAuthor;
}
