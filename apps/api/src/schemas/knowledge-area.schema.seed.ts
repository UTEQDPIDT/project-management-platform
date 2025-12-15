import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class KnowledgeArea extends Document {
  @ApiProperty({
    description: 'Área de conocimiento.',
  })
  @Prop({ required: true })
  name: string;
}

export const KnowledgeAreaSchema = SchemaFactory.createForClass(KnowledgeArea);
