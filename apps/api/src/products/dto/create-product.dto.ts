import { ApiProperty } from '@nestjs/swagger';
import { CoAuthor } from '@repo/types';
import { IsString, IsOptional, IsMongoId, IsEnum } from 'class-validator';
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
    description: 'Tipo de Co-Autor',
  })
  @IsEnum(CoAuthor)
  @IsOptional()
  coAuthor?: CoAuthor;
}
