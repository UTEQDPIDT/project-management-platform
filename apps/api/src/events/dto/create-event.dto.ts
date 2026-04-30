import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '@repo/types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsMongoId,
  Min,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'AttendanceTotals', async: false })
class AttendanceTotalsConstraint implements ValidatorConstraintInterface {
  validate(
    attendance: EventAttendanceDto | undefined,
    _args: ValidationArguments,
  ): boolean {
    if (!attendance) {
      return true;
    }

    return attendance.men + attendance.women <= attendance.totalParticipants;
  }

  defaultMessage(): string {
    return 'La suma de hombres y mujeres no puede exceder el total de participantes';
  }
}

export class EventAttendanceDto {
  @ApiProperty({
    description: 'Número total de participantes',
    example: 100,
  })
  @IsInt()
  @Min(0)
  totalParticipants: number;

  @ApiProperty({
    description: 'Número de participantes hombres',
    example: 50,
  })
  @IsInt()
  @Min(0)
  men: number;

  @ApiProperty({
    description: 'Número de participantes mujeres',
    example: 50,
  })
  @IsInt()
  @Min(0)
  women: number;
}

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
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de término del evento',
    example: '2025-05-01T00:00:00Z',
  })
  @IsOptional()
  @Type(() => Date)
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

  @ApiProperty({
    description: 'Indica si el evento acepta productos',
    example: false,
  })
  @IsBoolean()
  acceptsProducts: boolean;

  @ApiPropertyOptional({
    description: 'Listado de IDs de usuarios participantes',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  participants?: string[];

  @ApiPropertyOptional({ description: 'Datos de asistencia del evento' })
  @IsOptional()
  @Validate(AttendanceTotalsConstraint)
  @ValidateNested()
  @Type(() => EventAttendanceDto)
  attendance?: EventAttendanceDto;
}
