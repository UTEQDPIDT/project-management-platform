import { ApiProperty } from '@nestjs/swagger';
import { EntityType } from '@repo/types';
import { IsString, IsInt, IsMongoId, IsEnum } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({
    description: 'El nombre del archivo.',
  })
  @IsString()
  originalName: string;

  @ApiProperty({
    description: 'La URL del archivo almacenado.',
  })
  @IsString()
  url: string;

  @ApiProperty({
    description: 'El tamaño del archivo en bytes.',
  })
  @IsInt()
  size: number;

  @ApiProperty({
    description: 'El tipo de MIME del archivo. (pdf, png, jpeg, etc...)',
  })
  @IsString()
  mimetype: string;

  @ApiProperty({
    description: 'La entidad proprietaria del archivo.',
  })
  @IsMongoId()
  entityId: string;

  @ApiProperty({ description: 'El tipo de entidad proprietaria del archivo.' })
  @IsEnum(EntityType)
  entityType: EntityType;

  @IsMongoId()
  gridFsId: string;
}
