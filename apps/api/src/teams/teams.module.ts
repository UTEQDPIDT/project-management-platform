import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { Team, TeamSchema } from '../schemas/team.schema';
import { TeamResourceInterceptor } from './interceptors/team-resource.interceptor';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: 
    [MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    CaslModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService, TeamResourceInterceptor],
})
export class TeamsModule {}
