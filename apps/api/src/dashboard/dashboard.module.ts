import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Event, EventSchema } from '../schemas/event.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Team, TeamSchema } from '../schemas/team.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController]
})
export class DashboardModule {}
