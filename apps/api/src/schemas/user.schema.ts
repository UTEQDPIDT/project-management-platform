import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import {
  UserType,
  UserRole,
  CareerLevel,
  Sex,
  ResearcherType,
  EducationLevel,
  SniiLevel,
} from '@repo/types';
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
  canValidateElements: boolean;

  @ApiPropertyOptional({
    description: 'Permite que el usuario cierre proyectos con validación final.',
    default: false,
  })
  @Prop({ type: Boolean, default: false })
  canCloseElements: boolean;

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
    enum: Sex,
    nullable: true,
  })
  @Prop({ type: String, enum: Object.values(Sex), default: null })
  sex?: Sex | null;

  @ApiPropertyOptional({
    description: '¿Tiene alguna discapacidad?',
    nullable: true,
  })
  @Prop({ type: Boolean, default: null })
  hasDisability?: boolean | null;

  @ApiPropertyOptional({
    description: '¿Habla alguna lengua indígena?',
    nullable: true,
  })
  @Prop({ type: Boolean, default: null })
  speaksIndigenousLanguage?: boolean | null;

  @ApiPropertyOptional({
    description: 'Tipo de investigador.',
    enum: ResearcherType,
    nullable: true,
  })
  @Prop({ type: String, enum: Object.values(ResearcherType), default: null })
  researcherType?: ResearcherType | null;

  @ApiPropertyOptional({
    description: 'Nivel de estudios.',
    enum: EducationLevel,
    nullable: true,
  })
  @Prop({ type: String, enum: Object.values(EducationLevel), default: null })
  educationLevel?: EducationLevel | null;

  @ApiPropertyOptional({
    description: 'Nivel en el SNII.',
    enum: SniiLevel,
    nullable: true,
  })
  @Prop({ type: String, enum: Object.values(SniiLevel), default: null })
  sniiLevel?: SniiLevel | null;

  @ApiProperty({
    description: 'Fecha de nacimiento.',
  })
  @Prop({ type: Date })
  dateOfBirth: Date;

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

  @ApiPropertyOptional({
    description: 'Fecha de la última solicitud de recuperación de contraseña.',
  })
  @Prop({ select: false })
  passwordResetRequestedAt?: Date | null;
}
export const UserSchema = SchemaFactory.createForClass(User);
