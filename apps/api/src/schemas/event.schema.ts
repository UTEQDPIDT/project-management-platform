import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from './product.schema';
import { EventType } from '@repo/types';

@Schema({ timestamps: true })
export class Event extends Document {
  @ApiProperty({ description: 'Nombre del evento' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Resumen del evento', maxLength: 500 })
  @Prop({ required: true, maxLength: 500 })
  summary: string;

  @ApiProperty({ description: 'Fecha de inicio del evento' })
  @Prop({ required: true })
  startDate: Date;

  @ApiProperty({ description: 'Fecha de término evento' })
  @Prop()
  endDate?: Date;

  @ApiProperty({ description: 'Usuario que creo el evento' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @ApiProperty({ description: 'Usuario que actualizo el evento' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  updatedBy: User;

  @ApiProperty({ description: 'Organización que realiza el evento' })
  @Prop({ required: true })
  organization: string;

  @ApiProperty({ description: 'Ubicación del evento' })
  @Prop({ required: true })
  location: string;

  @ApiProperty({ description: 'Tipo de evento', enum: EventType })
  @Prop({ type: String, enum: Object.values(EventType), required: true })
  type: EventType;

  @ApiProperty({ description: 'Lista de participantes del evento' })
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  participants: User[];

  @ApiProperty({ description: 'Productos del evento' })
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] })
  products?: Product[];

  @ApiProperty({ description: 'Indica si el evento es privado' })
  @Prop({ default: false })
  isPrivate: boolean;

  @ApiProperty({ description: 'Indica si el evento acepta productos' })
  @Prop({ default: false })
  acceptsProducts: boolean;

  @ApiProperty({ description: 'Asistencia del evento' })
  @Prop({
    type: {
      totalParticipants: { type: Number, default: 0 },
      men: { type: Number, default: 0 },
      women: { type: Number, default: 0 },
    },
    default: undefined,
  })
  attendance?: {
    totalParticipants: number;
    men: number;
    women: number;
  };
}

export const EventSchema = SchemaFactory.createForClass(Event);
