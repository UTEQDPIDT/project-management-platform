import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ enum: ['student', 'teacher', 'admin'], default: 'student' })
  role: string;

  @Prop()
  displayName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  avatarUrl: string;

  @Prop({ unique: true, required: false })
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
  hashedRefreshToken: string;
}
