import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';
import { TeamsGrade } from '@repo/types';
import { User } from './user.schema';
import { Division } from './division.schema.seed';
import { TeamMembership } from './team-membership.schema';

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
    type: String,
    enum: Object.values(TeamsGrade),
    default: TeamsGrade.GRUPO_DE_INVESTIGACION,
  })
  @ApiProperty({
    description: 'El grado del equipo.',
  })
  grade: TeamsGrade;

  @Prop({ type: [TeamMembership], default: [] })
  memberships: TeamMembership[];

  @ApiProperty({ description: 'Indica si el equipo es privado' })
  @Prop({ default: false })
  isPrivate: boolean;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
