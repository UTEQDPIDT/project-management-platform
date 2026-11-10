import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { DevelopmentLine } from './development-line.schema.seed';

@Schema({ timestamps: true })
export class DevelopmentLineSubcategory extends Document {
  @ApiProperty({
    description: 'Subcategoría de la línea de desarrollo.',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Línea de desarrollo a la que pertenece la subcategoría.',
  })
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: DevelopmentLine.name,
    index: true,
  })
  developmentLine: DevelopmentLine;
}

export const DevelopmentLineSubcategorySchema = SchemaFactory.createForClass(
  DevelopmentLineSubcategory,
);
