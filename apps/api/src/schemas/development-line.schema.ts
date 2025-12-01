import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class DevelopmentLine extends Document {
    @ApiProperty({
        description: 'Línea de desarrollo académico.',
    })
    @Prop({ required: true })
    developmentLine: string;
}

export const DevelopmentLineSchema = SchemaFactory.createForClass(DevelopmentLine);
