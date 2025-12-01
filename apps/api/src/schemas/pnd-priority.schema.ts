import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class PNDpriority extends Document {
    @ApiProperty({
        description: 'Prioridad del PND.',
    })
    @Prop({ required: true })
    PNDpriority: string;
}

export const PNDprioritySchema = SchemaFactory.createForClass(PNDpriority);
