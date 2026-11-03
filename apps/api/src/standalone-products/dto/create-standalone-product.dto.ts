import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CoAuthor } from '@repo/types';
import { Allow, IsString, IsMongoId, IsEnum, IsOptional, ValidateIf } from 'class-validator';
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

    @ApiPropertyOptional({
        description: 'Equipo al que se vincula el producto. Cadena vacía para desvincular.',
    })
    @IsOptional()
    @ValidateIf((_, value) => value !== '')
    @IsMongoId()
    team?: string;

    @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    })
    @IsOptional()
    @Allow()
    file?: any;
}