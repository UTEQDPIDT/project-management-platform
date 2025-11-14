import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ enum: ['student', 'teacher', 'admin'], default: 'student' })
  role: string;

  @Prop({ default: '' })
  givenName: string;

  @Prop({ default: '' })
  familyName: string;

  @Prop({ required: true, unique: true, default: '' })
  email: string;

  @Prop({ default: '' })
  avatarUrl: string;

  @Prop({
    unique: true,
    required: false,
    maxLength: 10,
    minLength: 10,
    default: null,
  })
  matricula: string;

  @Prop({ default: '' })
  division: string;

  @Prop()
  educationalProgram: string;

  @Prop({ enum: ['tsu', 'licenciatura', 'posgrado'], default: 'licenciatura' })
  careerLevel: string;

  @Prop({ unique: true, required: false, default: null })
  employeeNumber: string;

  @Prop({ default: '' })
  hashedRefreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
