import { Prop, Schema } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';
import { ApiProperty } from '@nestjs/swagger';
import { TeamUserRole, TeamUserStatus } from '@repo/types';

@Schema()
export class TeamMembership {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    @ApiProperty({description: 'El usuario que es miembro del equipo.'})
    user: User;

    @Prop({
        enum: TeamUserRole,
        required: true,
    })
    @ApiProperty({description: 'El rol del usuario en el equipo.', enum: TeamUserRole})
    role: TeamUserRole;

    @Prop({
        enum: TeamUserStatus,
        default: TeamUserStatus.PENDING,
    })
    @ApiProperty({description: 'El estado del usuario en el equipo.', enum: TeamUserStatus})
    status: TeamUserStatus;

    @Prop()
    requestedAt?: Date;

    @Prop()
    approvedAt?: Date;
}
