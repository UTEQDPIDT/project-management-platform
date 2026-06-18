import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from '@nestjs/swagger';

@Schema({timestamps: true})
export class Programa extends Document {
    @ApiProperty({ 
        description: 'Nombre del Programa',
    })
    @Prop({ required: true })
    name: string;
}

export const ProgramaSchema = SchemaFactory.createForClass(Programa);