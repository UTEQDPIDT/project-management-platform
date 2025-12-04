import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';
import { TeamsGrade } from '@repo/types';
import { User } from './user.schema';
import { Division } from './division.schema.seed';

@Schema({ timestamps: true })
export class Team extends Document {
  @Prop({
    required: true,
    unique: true,
    maxLength: 50,
  })
  @ApiProperty({
    description: 'El nombre del equipo.',
  })
  teamName: string;

  @Prop({
    maxLength: 255,
  })
  @ApiProperty({
    description: 'Una breve descripción del equipo.',
    maxLength: 255,
  })
  summary: string;

  @ApiPropertyOptional({
    description:
      'La división a la que pertenece el equipo (referencia al catálogo)',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Division.name,
  })
  division: Division;

  @Prop({
    enum: TeamsGrade,
    default: TeamsGrade.FORMACION,
  })
  @ApiProperty({
    description: 'El grado del equipo.',
  })
  grade: TeamsGrade;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  @ApiProperty({
    description: 'El propietario del equipo.',
  })
  owner: User;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  })
  @ApiProperty({
    description: 'Lista de colaboradores del equipo.',
    isArray: true,
  })
  collaborators: User[];

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  })
  @ApiProperty({
    description: 'Lista de miembros del equipo.',
    isArray: true,
  })
  members: User[];

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  })
  @ApiProperty({
    description: 'Lista de solicitantes para unirse al equipo.',
    isArray: true,
  })
  userRequests: User[];

  @ApiProperty({ description: 'Indica si el equipo es privado' })
  @Prop({ default: false })
  isPrivate: boolean;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
