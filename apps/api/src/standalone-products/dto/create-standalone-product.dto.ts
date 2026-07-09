import { ApiProperty } from '@nestjs/swagger';
import { CoAuthor } from '@repo/types';
import { IsString, IsMongoId, IsEnum, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateStandaloneProductDto {
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
    coAuthor: CoAuthor;

    @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    })
    @IsOptional()
    file?: any;
}