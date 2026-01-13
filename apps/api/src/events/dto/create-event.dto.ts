import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '@repo/types';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
export class CreateEventDto {
  @ApiProperty({
    description: 'Nombre del evento',
    example: 'Feria de Ciencias 2025',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Resumen del evento',
    example:
      'Feria de ciencias  para muestra de proyectos de alumnos a académicos y directivos.',
    maxLength: 500,
  })
  @IsString()
  summary: string;

  @ApiProperty({
    description: 'Fecha de inicio del evento',
    example: '2025-05-01T00:00:00Z',
  })
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de término del evento',
    example: '2025-05-01T00:00:00Z',
  })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Organización que realiza el evento.',
    example: 'CONCYTEQ',
  })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiProperty({
    description: 'Ubicación del evento',
    example: 'Edificio PIDET, UTEQ.',
  })
  @IsString()
  location: string;

  @ApiProperty({
    description: 'Tipo de evento',
    enum: EventType,
    example: EventType.EXTERNO,
  })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({
    description: 'Indica si el evento es privado',
    example: false,
  })
  @IsBoolean()
  isPrivate: boolean;
}
