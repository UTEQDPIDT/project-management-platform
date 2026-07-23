import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserType, UserRole, CareerLevel, Sex, State } from '@repo/types';
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
  @Prop({ type: String, enum: Object.values(UserRole), default: UserRole.USER })
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Permite que el usuario aplique la primera validación de proyectos.',
    default: false,
  })
  @Prop({ type: Boolean, default: false })
  canValidateProjets: boolean;

  @ApiPropertyOptional({
    description: 'Permite que el usuario cierre proyectos con validación final.',
    default: false,
  })
  @Prop({ type: Boolean, default: false })
  canCloseProject: boolean;

  @ApiPropertyOptional({
    description: 'El tipo de usuario.',
    default: UserType.ESTUDIANTE,
    enum: UserType,
  })
  @Prop({
    type: String,
    enum: Object.values(UserType),
    default: UserType.ESTUDIANTE,
  })
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
    description: 'Contraseña del usuario.',
  })
  @Prop({ required: false, select: false })
  passwordHash?: string;

  @ApiPropertyOptional({
    description: 'La URL del avatar del usuario. Brindada por Google.',
  })
  @Prop()
  avatarUrl: string;

  @ApiPropertyOptional({
    description: 'El genero del usuario.',
    default: Sex.HOMBRE,
    enum: Sex,
  })
  @Prop({ type: String, enum: Object.values(Sex), default: Sex.HOMBRE })
  sex: Sex;

  @ApiPropertyOptional({
    description: 'El estado de origen del usuario.',
    default: State.QRO,
    enum: State,
  })
  @Prop({ type: String, enum: Object.values(State), default: State.QRO })
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
    sparse: true, // permite múltiples null
    maxLength: 10,
    minLength: 10,
  })
  matricula: string;

  @ApiPropertyOptional({
    description:
      'La división a la que pertenece el usuario (referencia al catálogo)',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Division.name,
  })
  division: Division;

  @ApiPropertyOptional({
    description:
      'El programa educativo al que pertenece el usuario (referencia al catálogo)',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: EducationalProgram.name,
  })
  educationalProgram: EducationalProgram;

  @ApiPropertyOptional({
    description: 'El nivel de carrera del usuario (si es estudiante).',
    default: CareerLevel.LICENCIATURA,
    enum: CareerLevel,
  })
  @Prop({
    type: String,
    enum: Object.values(CareerLevel),
    default: CareerLevel.LICENCIATURA,
  })
  careerLevel: CareerLevel;

  @ApiPropertyOptional({
    description:
      'El número de empleado del usuario (si es docente o administartivo.)',
    maxLength: 10,
    minLength: 5,
  })
  @Prop({ unique: true, sparse: true, required: false })
  employeeNumber: string;

  @ApiPropertyOptional({
    description: 'El token de refresco hasheado del usuario.',
  })
  @Prop({ select: false })
  hashedRefreshToken?: string | null;

  @ApiPropertyOptional({
    description: 'El token para restablecer contraseña hasheado del usuario.',
  })
  @Prop({ select: false })
  passwordResetTokenHash?: string | null;

  @ApiPropertyOptional({
    description: 'La fecha de expiración del token para restablecer contraseña.',
  })
  @Prop({ select: false })
  passwordResetExpiresAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Token de un solo uso para restablecer contraseña ha sido utilizado.',
  })
  @Prop({ select: false })
  passwordResetUsedAt?: Date | null;
}
export const UserSchema = SchemaFactory.createForClass(User);
