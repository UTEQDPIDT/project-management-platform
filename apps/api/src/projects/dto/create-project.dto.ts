import { ApiProperty } from '@nestjs/swagger';
import { ImpactLevel, Status } from '@repo/types';
import {
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

  @ApiProperty({
    description:
      'Progreso general del proyecto, promedio de actividades completadas.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiProperty({
    description: 'Categorías a las que pertenece el proyecto.',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Áreas de conocimiento que alude el proyecto.',
  })
  @IsString()
  knowledgeAreas: string;

  @ApiProperty({
    description: 'Áreas de impacto del proyecto.',
  })
  @IsString()
  impactAreas: string;

  @ApiProperty({
    description: 'Prioridades Nacionales.',
  })
  @IsString()
  prioritiesPND: string;

  @ApiProperty({
    description: 'Objetivos sustentables a los que apunta el proyecto.',
  })
  @IsString()
  sustainableObjectives: string;

  @ApiProperty({
    description: 'Lineas de innovación a las que se alinea el proyecto.',
  })
  @IsString()
  innovationLines: string;

  @ApiProperty({
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

  @ApiProperty({
    description: 'Equipo que trabaja en el proyecto.',
  })
  @IsOptional()
  @IsMongoId()
  team: string;

  @ApiProperty({
    description: 'Otros proyectos relacionados o previos al proyecto.',
  })
  @IsOptional()
  @IsMongoId({ each: true })
  relatedProjects: string[];

  @ApiProperty({
    description: 'Actividades relacionadas al proyecto.',
  })
  @IsOptional()
  @IsMongoId({ each: true })
  activities: string[];

  @ApiProperty({
    description: 'Productos relacionados al proyecto.',
  })
  @IsOptional()
  @IsMongoId({ each: true })
  products: string[];

  @ApiProperty({
    description: 'Archivos relacionados al proyecto',
  })
  @IsOptional()
  @IsMongoId({ each: true })
  files: string[];

  @ApiProperty({
    description: 'Fecha de inicio del proyecto, esta será el inicio del plazo.',
  })
  @IsOptional()
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'Fecha final de vencimiento del proyecto' })
  @IsOptional()
  @IsDate()
  endDate: Date;
}
