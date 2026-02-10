import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImpactLevel, Status } from '@repo/types';
import { IsArray, IsDate, IsEnum, IsInt, IsMongoId, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Nombre del proyecto.', 
    example: 'Proyecto de innovación tecnológica para la agricultura',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Objetivo principal del proyecto.',
    example: 'Desarrollar una solución tecnológica innovadora para mejorar la eficiencia en la agricultura',
  })
  @IsString()
  @MaxLength(500)
  objective: string;

  @ApiProperty({
    description: 'Nivel de maduración del Proyecto.',
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(9)
  trlRating: number;

  @ApiProperty({
    description: 'Estado actual del proyecto.',
    example: Status.PENDING,
  })
  @IsEnum(Status)
  status: Status;

  @ApiPropertyOptional({
    description: 'Áreas de conocimiento que alude el proyecto.',
    example: ['64b8f0f2c2a3f2b1d6e4c123'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  knowledgeAreas: string;

  @ApiPropertyOptional({
    description: 'Áreas de impacto del proyecto.',
    example: ['64b8f0f2c2a3f2b1d6e4c456'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  impactAreas: string[];

  @ApiPropertyOptional({
    description: 'Prioridades Nacionales.',
    example: ['64b8f0f2c2a3f2b1d6e4c789'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  prioritiesPND: string[];

  @ApiPropertyOptional({
    description: 'Objetivos sustentables a los que apunta el proyecto.',
    example: ['64b8f0f2c2a3f2b1d6e4c789'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  sustainableObjectives: string[];

  @ApiPropertyOptional({
    description: 'Lineas de innovación a las que se alinea el proyecto.',
    example: ['64b8f0f2c2a3f2b1d6e4c789'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  innovationLines: string[];

  @ApiPropertyOptional({
    description: 'Organización a la que le pertenece el proyecto.',
    example: 'Universidad Nacional Autónoma de México',
  })
  @IsOptional()
  @IsString()
  organization: string;

  @ApiProperty({
    description: 'Niveles de impacto del proyecto.',
    example: ImpactLevel.NACIONAL,
  })
  @IsEnum(ImpactLevel)
  impactLevel: ImpactLevel;

  @ApiPropertyOptional({
    description: 'Equipo que trabaja en el proyecto.',
    example: '64b8f0f2c2a3f2b1d6e4c789',
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
    description: 'Fecha de inicio del proyecto, esta será el inicio del plazo.',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional({
    description: 'Fecha final de vencimiento del proyecto',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDate()
  endDate: Date;
}
