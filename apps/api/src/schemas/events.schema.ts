import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Activity } from './activities.schema';
import { Product } from './product.schema';
import { EventType } from '@repo/types';

@Schema({ timestamps: true })
export class Event extends Document{

    @ApiProperty({ description: 'Nombre del evento' })
    @Prop({ required: true })
    name: string;

    @ApiProperty({ description: 'Resumen del evento', maxLength: 500 })
    @Prop({ maxLength: 500 })
    summary?: string;

    @ApiProperty({ description: 'Fecha del evento' })
    @Prop()
    date: Date;

    @ApiProperty({ description: 'Usuario que creo el evento' })
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    createdBy: User;

    @ApiProperty({ description: 'Usuario que actualizo el evento' })
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    updatedBy?: User;

    @ApiProperty({ description: 'Organización que realiza el evento' })
    @Prop({ required: true })
    organization: string;

    @ApiProperty({ description: 'Ubicación del evento' })
    @Prop({ required: true })
    location: string;

    @ApiProperty({ description: 'Tipo de evento', enum: EventType })
    @Prop({ enum: EventType, required: true })
    type: EventType;

    @ApiProperty({ description: 'Lista de participantes del evento' })
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    participants: User[];

    @ApiProperty({ description: 'Reporte del evento' })
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'File' })
    report: string;

    @ApiProperty({ description: 'Indica si el evento es privado' })
    @Prop({ default: false })
    isPrivate: boolean;

    @ApiProperty({ description: 'Actividades del evento' })
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }] })
    activities: Activity[];

    @ApiProperty({ description: 'Productos del evento' })
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] })
    products?: Product[];
    }

export const EventSchema = SchemaFactory.createForClass(Event);
