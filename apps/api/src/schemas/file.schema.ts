import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class File extends Document {
  @ApiProperty({
    description: 'El nombre del archivo.',
  })
  @Prop()
  name: string;

  @ApiProperty({
    description: 'La URL del archivo almacenado.',
  })
  @Prop()
  url: string;

  @ApiProperty({
    description: 'El tamaño del archivo en bytes.',
  })
  @Prop()
  size: number;

  @ApiProperty({
    description: 'El tipo de MIME del archivo. (pdf, png, jpeg, etc...)',
  })
  @Prop()
  mimetype: string;

  @ApiProperty({
    description: 'El proprietario del archivo.',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  owner: mongoose.Types.ObjectId;
}

export const FileSchema = SchemaFactory.createForClass(File);
