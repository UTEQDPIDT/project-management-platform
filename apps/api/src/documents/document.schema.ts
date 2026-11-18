import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Recognition extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ default: '' })
  userAvatarUrl: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  projectId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  projectName: string;

  @Prop({ required: true })
  folio: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  issuedAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  fileId: mongoose.Types.ObjectId;
}

export const RecognitionSchema = SchemaFactory.createForClass(Recognition);
RecognitionSchema.index({ year: 1, folio: 1 }, { unique: true });
