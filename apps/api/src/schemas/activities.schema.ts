import { Schema, Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Activity {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  priority: string;

  @Prop({ required: true })
  status: string;

  @Prop({ default: false })
  checked?: boolean;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  updatedBy?: User;

  @Prop()
  dueDate?: Date;

  @Prop()
  dueDateEnd?: Date;
}
