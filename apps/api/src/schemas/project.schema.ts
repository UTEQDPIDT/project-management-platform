import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Status, ImpactLevel } from '@repo/types';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';
import { Team } from './team.schema';
import { Activity } from './activities.schema';
import { Product } from './product.schema';
import { File } from './file.schema';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Project extends Document {
  @ApiProperty({
    description: 'Nombre del proyecto.',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Resumen del proyecto.',
  })
  @Prop({ required: true, maxLength: 500 })
  summary: string;

  @ApiProperty({
    description: 'Objetivo principal del proyecto.',
  })
  @Prop({ required: true, maxLength: 500 })
  objective: string;

  @ApiProperty({
    description: 'Nivel de maduración del Proyecto.',
  })
  @Prop({ required: true, min: 1, max: 9 })
  trlRating: number;

  @ApiProperty({
    description: 'Estado actual del proyecto.',
  })
  @Prop({
    required: true,
    type: String,
    enum: Object.values(Status),
    default: Status.PENDING,
    index: true,
  })
  status: Status;

  @ApiProperty({
    description:
      'Progreso general del proyecto, promedio de actividades completadas.',
  })
  @Prop({ min: 0, max: 100, default: 0 })
  progress: number;

  @ApiProperty({
    description: 'Categorías a las que pertenece el proyecto.',
  })
  @Prop({})
  category: string;

  @ApiProperty({
    description: 'Áreas de conocimiento que alude el proyecto.',
  })
  @Prop({})
  knowledgeAreas: string;

  @ApiProperty({
    description: 'Áreas de impacto del proyecto.',
  })
  @Prop({})
  impactAreas: string;

  @ApiProperty({
    description: 'Prioridades Nacionales.',
  })
  @Prop({})
  prioritiesPND: string;

  @ApiProperty({
    description: 'Objetivos sustentables a los que apunta el proyecto.',
  })
  @Prop({})
  sustainableObjectives: string;

  @ApiProperty({
    description: 'Lineas de innovación a las que se alinea el proyecto.',
  })
  @Prop({})
  innovationLines: string;

  @ApiProperty({
    description: 'Organización a la que le pertenece el proyecto.',
  })
  @Prop({})
  organization: string;

  @ApiProperty({
    description: 'Niveles de impacto del proyecto.',
  })
  @Prop({
    required: true,
    type: String,
    enum: Object.values(ImpactLevel),
    default: ImpactLevel.LOCAL,
  })
  impactLevel: ImpactLevel;

  @ApiProperty({
    description: 'Dueño del proyecto.',
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true })
  owner: User;

  @ApiProperty({
    description: 'Equipo que trabaja en el proyecto.',
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Team', index: true })
  team: Team;

  @ApiProperty({
    description: 'Otros proyectos relacionados o previos al proyecto.',
  })
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }] })
  relatedProjects: Project[];

  @ApiProperty({
    description: 'Actividades relacionadas al proyecto.',
  })
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }] })
  activities: Activity[];

  @ApiProperty({
    description: 'Productos relacionados al proyecto.',
  })
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] })
  products: Product[];

  @ApiProperty({
    description: 'Archivos relacionados al proyecto',
  })
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }] })
  files: File[];

  @ApiProperty({
    description: 'Quien actualiza el proyecto por ultima ocasion.',
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true })
  updatedBy: User;

  @ApiProperty({
    description: 'Fecha de inicio del proyecto, esta será el inicio del plazo.',
  })
  @Prop()
  startDate?: Date;

  @ApiProperty({ description: 'Fecha final de vencimiento del proyecto' })
  @Prop()
  endDate?: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
