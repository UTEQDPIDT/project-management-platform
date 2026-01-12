import { ApiProperty } from '@nestjs/swagger';
import { FileOwnerType } from '@repo/types';
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
  ownerId: string;

  @ApiProperty({ description: 'El tipo de entidad proprietaria del archivo.' })
  @IsEnum(FileOwnerType)
  ownerType: FileOwnerType;

  @IsMongoId()
  gridFsId: string;
}
