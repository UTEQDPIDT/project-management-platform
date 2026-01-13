import { ApiProperty } from '@nestjs/swagger';
import { EntityType } from '@repo/types';
import { IsEnum, IsMongoId } from 'class-validator';

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
}
