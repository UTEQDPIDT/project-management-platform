import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { File } from './file.schema';
import { User } from './user.schema';
import { CoAuthor } from '@repo/types';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  subcategory: string;

  @Prop({ maxLength: 255 })
  details: string;

  @Prop({ required: false, enum: CoAuthor, default: CoAuthor.A })
  coAuthor: CoAuthor;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }] })
  files: File[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
