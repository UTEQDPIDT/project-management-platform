import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ enum: ['student', 'teacher', 'admin'], default: 'student' })
  role: string;

  @Prop()
  givenName: string;

  @Prop()
  familyName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  avatarUrl: string;

  @Prop({
    unique: true,
    required: false,
    maxLength: 10,
    minLength: 10,
  })
  matricula: string;

  @Prop()
  division: string;

  @Prop()
  educationalProgram: string;

  @Prop({ enum: ['tsu', 'licenciatura', 'posgrado'], default: 'licenciatura' })
  careerLevel: string;

  @Prop({ unique: true, required: false })
  employeeNumber: string;

  @Prop()
  hashedRefreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
