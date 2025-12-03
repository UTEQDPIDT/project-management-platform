import { ApiProperty } from '@nestjs/swagger';
import { Priority, Status } from '@repo/types';
import { IsBoolean, IsDate, IsEnum, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({ 
    description: 'Nombre de la actividad',
    example: 'Entrega del proyecto final'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Descripcion de la actividad',
    maxLength: 500,
    example: 'Descripción detallada de la actividad a realizar.'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ 
    description: 'Prioridad de la actividad',
    enum: Priority,
    example: Priority.HIGH
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ 
    description: 'Estado de la actividad',
    enum: Status,
    example: Status.PENDING
  })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({
    description: 'Sirve para filtrar las actividades completadas', 
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  checked?: boolean;

  @ApiProperty({ 
    type: 'string',
    format: 'binary',
    required: false,
    isArray: true,
    description: 'Evidencias de la actividad.'
  })
  @IsOptional()
  @IsMongoId({ each: true })
  files?: any[];

  @ApiProperty({ 
    description: 'Fecha de vencimiento de la actividad. Al existir una fecha final de vencimiento, esta será el inicio del plazo.',
    example: '2024-12-30T23:59:59.999Z'
  })
  @IsOptional()
  @IsDate()
  dueDate?: Date;

  @ApiProperty({ 
    description: 'Fecha final de vencimiento de la actividad',
    example: '2024-12-31T23:59:59.999Z'
  })
  @IsOptional()
  @IsDate()
  dueDateEnd?: Date;
}
