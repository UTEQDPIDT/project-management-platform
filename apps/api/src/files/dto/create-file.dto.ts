import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsMongoId } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({
    description: 'El nombre del archivo.',
  })
  @IsString()
  name: string;

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
    description: 'El proprietario del archivo.',
  })
  @IsMongoId()
  owner: string;
}
