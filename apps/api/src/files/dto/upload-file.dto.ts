import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityType, FilePurpose } from '@repo/types';
import { Allow, IsEnum, IsMongoId, IsOptional } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    type: String,
    description: 'El ID de la entidad dueña del archivo',
  })
  @IsMongoId()
  entityId: string;

  @ApiProperty({
    enum: EntityType,
    description:
      'El tipo de entidad dueña del archivo. e.g. Proyecto, Evento, etc.',
  })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty({ enum: FilePurpose, description: 'El propósito del archivo.' })
  @IsEnum(FilePurpose)
  purpose: FilePurpose;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  @Allow()
  file?: any;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @Allow()
  files?: any;
}
