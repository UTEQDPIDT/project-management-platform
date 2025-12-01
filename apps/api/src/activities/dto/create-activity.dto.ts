import { ApiProperty } from '@nestjs/swagger';
import { Priority, Status } from '@repo/types';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({ description: 'Nombre de la actividad' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Descripcion de la actividad', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Prioridad de la actividad' })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ description: 'Estado de la actividad' })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({
    description: 'Sirve para filtrar las actividades completadas',
  })
  @IsOptional()
  @IsBoolean()
  checked?: boolean;

  @ApiProperty({ description: 'Evidencias de la actividad.' })
  @IsOptional()
  @IsMongoId({ each: true })
  files?: string[];

  @ApiProperty({
    description:
      'Fecha de vencimiento de la actividad. Al existir una fecha final de vencimiento, esta será el inicio del plazo.',
  })
  @IsOptional()
  @IsDate()
  dueDate?: Date;

  @ApiProperty({ description: 'Fecha final de vencimiento de la actividad' })
  @IsOptional()
  @IsDate()
  dueDateEnd?: Date;
}
