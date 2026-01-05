import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImpactLevel, Status } from '@repo/types';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Nombre del proyecto.',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Resumen del proyecto.',
  })
  @IsString()
  @MaxLength(500)
  summary: string;

  @ApiProperty({
    description: 'Objetivo principal del proyecto.',
  })
  @IsString()
  @MaxLength(500)
  objective: string;

  @ApiProperty({
    description: 'Nivel de maduración del Proyecto.',
  })
  @IsInt()
  @Min(1)
  @Max(9)
  trlRating: number;

  @ApiProperty({
    description: 'Estado actual del proyecto.',
  })
  @IsEnum(Status)
  status: Status;

  @ApiPropertyOptional({
    description: 'Áreas de conocimiento que alude el proyecto.',
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  knowledgeAreas: string;

  @ApiPropertyOptional({
    description: 'Áreas de impacto del proyecto.',
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  impactAreas: string;

  @ApiPropertyOptional({
    description: 'Prioridades Nacionales.',
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  prioritiesPND: string;

  @ApiPropertyOptional({
    description: 'Objetivos sustentables a los que apunta el proyecto.',
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  sustainableObjectives: string;

  @ApiPropertyOptional({
    description: 'Lineas de innovación a las que se alinea el proyecto.',
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  innovationLines: string[];

  @ApiPropertyOptional({
    description: 'Organización a la que le pertenece el proyecto.',
  })
  @IsOptional()
  @IsString()
  organization: string;

  @ApiProperty({
    description: 'Niveles de impacto del proyecto.',
  })
  @IsEnum(ImpactLevel)
  impactLevel: ImpactLevel;

  @ApiPropertyOptional({
    description: 'Equipo que trabaja en el proyecto.',
  })
  @IsOptional()
  @IsMongoId()
  team: string;

  @ApiPropertyOptional({
    description: 'Otros proyectos relacionados o previos al proyecto.',
  })
  @IsOptional()
  @IsMongoId({ each: true })
  relatedProjects: string[];

  @ApiPropertyOptional({
    description: 'Actividades relacionadas al proyecto.',
  })
  @IsOptional()
  @IsArray()
  activities: { name: string }[];

  @ApiPropertyOptional({
    description: 'Productos relacionados al proyecto.',
  })
  @IsOptional()
  @IsMongoId({ each: true })
  products: string[];

  @ApiPropertyOptional({
    description: 'Archivos relacionados al proyecto',
  })
  @IsOptional()
  @IsMongoId({ each: true })
  files: string[];

  @ApiPropertyOptional({
    description: 'Fecha de inicio del proyecto, esta será el inicio del plazo.',
  })
  @IsOptional()
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional({
    description: 'Fecha final de vencimiento del proyecto',
  })
  @IsOptional()
  @IsDate()
  endDate: Date;
}
