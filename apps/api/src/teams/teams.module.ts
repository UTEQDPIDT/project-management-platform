import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { Team, TeamSchema } from '../schemas/team.schema';

@Module({
  imports: 
    [MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }])
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
