import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class ThemedImpactArea extends Document {
  @ApiProperty({
    description: 'Área temática de impacto.',
  })
  @Prop({ required: true })
  name: string;
}

export const ThemedImpactAreaSchema =
  SchemaFactory.createForClass(ThemedImpactArea);
