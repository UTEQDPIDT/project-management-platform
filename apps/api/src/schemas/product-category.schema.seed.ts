import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class ProductCategory extends Document {
  @ApiProperty({
    description: 'Categoría del producto.',
  })
  @Prop({ required: true })
  name: string;
}

export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);
