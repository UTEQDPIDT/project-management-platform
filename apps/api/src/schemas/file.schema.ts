import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';
import { EntityType, FilePurpose } from '@repo/types';

@Schema({ timestamps: true })
export class File extends Document {
  @ApiProperty({
    description: 'El nombre del archivo.',
  })
  @Prop()
  originalName: string;

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
    description:
      'La entidad proprietaria del archivo. (Proyectos, Eventos, etc...)',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
  entityId: mongoose.Types.ObjectId;

  @ApiProperty({
    description: 'El tipo de entidad propietaria del archivo.',
    enum: EntityType,
  })
  @Prop({ type: String, enum: Object.values(EntityType), required: true })
  entityType: EntityType;

  @ApiProperty({ description: 'El propósito del archivo.', enum: FilePurpose })
  @Prop({
    type: String,
    enum: Object.values(FilePurpose),
    required: true,
    default: FilePurpose.GENERIC,
  })
  purpose: FilePurpose;

  @ApiProperty({ description: 'El usuario que subió el archivo' })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  owner: User;

  @ApiProperty({ description: 'ID del archivo almacenado en GridFS.' })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
  gridFsId: mongoose.Types.ObjectId;
}

export const FileSchema = SchemaFactory.createForClass(File);
