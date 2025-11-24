import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';
import { TeamsGrade } from '../enums/teams-grade.enum';

@Schema({ timestamps: true })
export class Team extends Document { //Id automático de mongoose (extends Document)

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

    @Prop({
        enum: TeamsGrade, 
        default: TeamsGrade.FORMACION
    })
    @ApiProperty({
        description: 'El grado del equipo.',
    })
    grade: TeamsGrade;

    @Prop({ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    })
    @ApiProperty({
        description: 'El propietario del equipo.',
    })
    owner: mongoose.Types.ObjectId;

    @Prop({
        type: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        }],
    })
    @ApiProperty({
        description: 'Lista de colaboradores del equipo.',
        isArray: true,
    })
    collaborators: mongoose.Types.ObjectId[];

    @Prop({
        type: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        }],
    })
    @ApiProperty({
        description: 'Lista de miembros del equipo.',
        isArray: true,
    })
    members: mongoose.Types.ObjectId[];

    @Prop({
        type: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        }],
    })
    @ApiProperty({
        description: 'Lista de solicitantes para unirse al equipo.',
        isArray: true,
    })
    userRequests: mongoose.Types.ObjectId[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);