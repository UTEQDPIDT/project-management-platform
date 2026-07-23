import { ApiProperty } from '@nestjs/swagger';
import { EntityType, Priority, Status } from '@repo/types';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongoose';

export class CreateActivityDto {
  @ApiProperty({
    description: 'Nombre de la actividad',
    example: 'Entrega del proyecto final',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descripcion de la actividad',
    maxLength: 500,
    example: 'Descripción detallada de la actividad a realizar.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Prioridad de la actividad',
    enum: Priority,
    example: Priority.HIGH,
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({
    description: 'Estado de la actividad',
    enum: Status,
    example: Status.PENDING,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiProperty({
    description: 'Sirve para filtrar las actividades completadas',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  checked?: boolean;

  @ApiProperty({
    description:
      'Fecha de vencimiento de la actividad. Al existir una fecha final de vencimiento, esta será el inicio del plazo.',
    example: '2024-12-30T23:59:59.999Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @ApiProperty({
    description: 'Fecha final de vencimiento de la actividad',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDateEnd?: Date;

  @ApiProperty({description: 'Entidad a la que pertenece la actividad'})
  @IsMongoId()
  entityId: ObjectId;

  @ApiProperty({description: 'Tipo de entidad a la que pertenece la actividad (proyecto o evento)'})
  @IsEnum(EntityType)
  entityType: EntityType

  @ApiProperty({
    description: 'Listado de IDs de usuarios asignados a la actividad',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assignees?: string[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  files?: Express.Multer.File[];
}
