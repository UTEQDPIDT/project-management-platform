import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';
import { CoAuthor } from '@repo/types';
import { ProductCategory } from './product-category.schema.seed';
import { ProductSubcategory } from './product-subcategory.schema.seed';

@Schema({ timestamps: true })
export class StandaloneProduct extends Document {
    @Prop({ required: true, trim: true, maxlength: 100 })
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

    @Prop({
        required: false,
        type: String,
        enum: Object.values(CoAuthor),
        default: CoAuthor.A,
    })
    coAuthor: CoAuthor;

    @Prop({
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    })
    owner: User;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    updatedBy: User;

    createdAt: Date;
    updatedAt: Date;

}

export const StandaloneProductSchema = SchemaFactory.createForClass(StandaloneProduct);