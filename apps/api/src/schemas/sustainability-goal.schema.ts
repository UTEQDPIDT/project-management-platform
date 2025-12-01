import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class SustainabilityGoal extends Document {
    @ApiProperty({
        description: 'Objetivo de sostenibilidad.',
    })
    @Prop({ required: true })
    sustainabilityGoal: string;
}

export const SustainabilityGoalSchema = SchemaFactory.createForClass(SustainabilityGoal);
