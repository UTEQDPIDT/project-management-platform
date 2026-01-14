import { Prop, Schema } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class TeamMembership {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    @ApiProperty({
        description: 'El usuario que es miembro del equipo.',
    })
    user: User;

    @Prop({
        enum: ['OWNER', 'MEMBER', 'COLLABORATOR'],
        required: true,
    })
    role: 'OWNER' | 'MEMBER' | 'COLLABORATOR';

    @Prop({
        enum: ['ACTIVE', 'PENDING', 'REJECTED'],
        default: 'PENDING',
    })
    status: 'ACTIVE' | 'PENDING' | 'REJECTED';

    @Prop()
    requestedAt?: Date;

    @Prop()
    approvedAt?: Date;
}
