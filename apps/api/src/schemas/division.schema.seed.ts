import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Division extends Document {
    @ApiProperty({
        description: 'Nombre de la división.',
    })
    @Prop({ required: true })
    name: string;
}

export const DivisionSchema = SchemaFactory.createForClass(Division);
