import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { File } from './file.schema';
import { User } from './user.schema';
import { CoAuthor } from '@repo/types';
import { ProductCategory } from './product-category.schema.seed';
import { ProductSubcategory } from './product-subcategory.schema.seed';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ProductCategory.name,
    required: true,
  })
  category: ProductCategory;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ProductSubcategory.name,
    required: true,
  })
  subcategory: ProductSubcategory;

  @Prop({ maxLength: 255 })
  details: string;

  @Prop({ required: false, enum: CoAuthor, default: CoAuthor.A })
  coAuthor: CoAuthor;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }] })
  files: File[];

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  updatedBy: User;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
