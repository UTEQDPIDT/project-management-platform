import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority, Status } from '@repo/types';

@Schema({ timestamps: true })
export class Activity extends Document {
  @ApiProperty({ description: 'Nombre de la actividad' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Descripcion de la actividad', maxLength: 255 })
  @Prop({ maxLength: 255 })
  description?: string;

  @ApiProperty({ description: 'Prioridad de la actividad' })
  @Prop({ type: String, enum: Object.values(Priority) })
  priority?: Priority;

  @ApiProperty({ description: 'Estado de la actividad' })
  @Prop({
    type: String,
    enum: Object.values(Status),
    default: Status.PENDING,
  })
  status?: Status;

  @ApiProperty({
    description: 'Sirve para filtrar las actividades completadas',
  })
  @Prop({ default: false })
  checked?: boolean;

  @ApiPropertyOptional({ description: 'A quien se le asigna la actividad.' })
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  assignees?: User[];

  @ApiProperty({ description: 'Usuario que creo la activiad' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @ApiProperty({ description: 'Usuario que actualizo la actividad' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  updatedBy?: User;

  @ApiProperty({ description: 'Evidencias de la actividad.' })
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }] })
  files?: string[];

  @ApiProperty({
    description:
      'Fecha de vencimiento de la actividad. Al existir una fecha final de vencimiento, esta será el inicio del plazo.',
  })
  @Prop()
  dueDate?: Date;

  @ApiProperty({ description: 'Fecha final de vencimiento de la actividad' })
  @Prop()
  dueDateEnd?: Date;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
