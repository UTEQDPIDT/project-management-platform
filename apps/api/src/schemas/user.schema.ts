import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';
import { CareerLevel } from '../enums/career-level.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

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

  @Prop({ enum: CareerLevel, default: CareerLevel.LICENCIATURA })
  careerLevel: CareerLevel;

  @Prop({ unique: true, required: false })
  employeeNumber: string;

  @Prop()
  hashedRefreshToken?: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
