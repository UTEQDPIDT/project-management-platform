import { ApiProperty } from '@nestjs/swagger';
import { FileOwnerType } from '@repo/types';
import { IsEnum, IsMongoId } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    type: String,
    description: 'El ID de la entidad dueña del archivo',
  })
  @IsMongoId()
  ownerId: string;

  @ApiProperty({
    enum: FileOwnerType,
    description:
      'El tipo de entidad dueña del archivo. e.g. Proyecto, Evento, etc.',
  })
  @IsEnum(FileOwnerType)
  ownerType: FileOwnerType;
}
