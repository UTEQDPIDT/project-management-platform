import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class ProductSubcategory extends Document {
  @ApiProperty({
    description: 'Subcategoría del producto.',
  })
  @Prop({ required: true })
  name: string;
}

export const ProductSubcategorySchema =
  SchemaFactory.createForClass(ProductSubcategory);
