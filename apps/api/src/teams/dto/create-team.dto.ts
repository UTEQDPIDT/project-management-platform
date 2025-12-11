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
    default: TeamsGrade.FORMACION,
    enum: TeamsGrade,
  })
  @IsOptional()
  @IsEnum(TeamsGrade)
  grade?: TeamsGrade;
}
