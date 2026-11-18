import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Activity, ActivitySchema } from '../schemas/activities.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { Team, TeamSchema } from '../schemas/team.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Recognition, RecognitionSchema } from './document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recognition.name, schema: RecognitionSchema },
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Activity.name, schema: ActivitySchema },
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
