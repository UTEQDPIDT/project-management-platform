import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserType, UserRole, CareerLevel } from '@repo/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Division } from './division.schema.seed';
import { EducationalProgram } from './educational-program.schema.seed';

@Schema({ timestamps: true })
export class User extends Document {
  @ApiPropertyOptional({
    description: 'El Rol que el usuario tiene dentro del sistema.',
    default: UserRole.USER,
    enum: UserRole,
  })
  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ApiPropertyOptional({
    description: 'El tipo de usuario.',
    default: UserType.STUDENT,
    enum: UserType,
  })
  @Prop({ enum: UserType, default: UserType.STUDENT })
  type: UserType;

  @ApiProperty({
    description: 'Nombre(s) del usuario.',
  })
  @Prop()
  givenName: string;

  @ApiProperty({
    description: 'Appellido(s) del usuario.',
  })
  @Prop()
  familyName: string;

  @ApiProperty({
    description: 'La dirección de correo institucional del usuario.',
  })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiPropertyOptional({
    description: 'La URL del avatar del usuario. Brindada por Google.',
  })
  @Prop()
  avatarUrl: string;

  @ApiPropertyOptional({
    description: 'El genero del usuario.',
    default: Gender.HOMBRE,
    enum: Gender,
  })
  @Prop({ enum: Gender, default: Gender.HOMBRE })
  gender: Gender;

  @ApiPropertyOptional({
    description: 'El estado de origen del usuario.',
    default: State.QRO,
    enum: State,
  })
  @Prop({ enum: State, default: State.QRO })
  state: State;

  @ApiProperty({
    description: 'Fecha de nacimiento.',
  })
  @Prop({ type: Date })
  dateOfBirth: Date;

  @ApiPropertyOptional({
    description: 'La matrícula del usuario (si es estudiante).',
    maxLength: 10,
    minLength: 10,
  })
  @Prop({
    unique: true,
    required: false,
    maxLength: 10,
    minLength: 10,
  })
  matricula: string;

  @ApiPropertyOptional({
    description: 'La división a la que pertenece el usuario (referencia al catálogo)',
  })
  @Prop({ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: Division.name })
  division: Division;

  @ApiPropertyOptional({
    description: 'El programa educativo al que pertenece el usuario (referencia al catálogo)',
  })
  @Prop({ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: EducationalProgram.name })
  educationalProgram: EducationalProgram;

  @ApiPropertyOptional({
    description: 'El nivel de carrera del usuario (si es estudiante).',
    default: CareerLevel.LICENCIATURA,
    enum: CareerLevel,
  })
  @Prop({ enum: CareerLevel, default: CareerLevel.LICENCIATURA })
  careerLevel: CareerLevel;

  @ApiPropertyOptional({
    description:
      'El número de empleado del usuario (si es docente o administartivo.)',
    maxLength: 10,
    minLength: 5,
  })
  @Prop({ unique: true, required: false })
  employeeNumber: string;

  @ApiPropertyOptional({
    description: 'El token de refresco hasheado del usuario.',
  })
  @Prop()
  hashedRefreshToken?: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
