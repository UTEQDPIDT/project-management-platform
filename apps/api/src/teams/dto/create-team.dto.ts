import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TeamsGrade } from '@repo/types';
import { ObjectId } from 'mongoose';

export class CreateTeamDto {
  @ApiPropertyOptional({
    description: 'IDs de los usuarios que serán miembros del equipo.',
    type: [String],
    example: ['65a1b2c3d4e5f6a7b8c9d0e1'],
  })
  @IsOptional()
  @IsMongoId({ each: true })
  members?: string[];

  @ApiPropertyOptional({
    description: 'IDs de los usuarios que serán colaboradores del equipo.',
    type: [String],
    example: ['65a1b2c3d4e5f6a7b8c9d0e2'],
  })
  @IsOptional()
  @IsMongoId({ each: true })
  collaborators?: string[];

  @ApiProperty({
    description: 'El nombre del equipo.',
    example: 'Equipo DTAI',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  teamName: string;

  @ApiPropertyOptional({
    description: 'Una breve descripción del equipo.',
    example: 'Equipo enfocado en el desarrollo de modelos CAD.',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  summary?: string;

  @ApiPropertyOptional({
    description:
      'La división a la que pertenece el equipo (referencia al catálogo)',
  })
  @IsOptional()
  @IsMongoId()
  division?: ObjectId;

  @ApiPropertyOptional({
    description: 'El grado del equipo.',
    default: TeamsGrade.GRUPO_DE_INVESTIGACION,
    enum: TeamsGrade,
  })
  @IsOptional()
  @IsEnum(TeamsGrade)
  grade?: TeamsGrade;
}
