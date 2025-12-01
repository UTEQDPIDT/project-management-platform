import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class EducationalProgram extends Document {
    @ApiProperty({
        description: 'Nombre del programa educativo.',
    })
    @Prop({ required: true })
    educationalProgram: string;
}

export const EducationalProgramSchema = SchemaFactory.createForClass(EducationalProgram);
