import { Module, forwardRef } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Activity, ActivitySchema } from '../schemas/activities.schema';
import { FilesModule } from '../files/files.module';
import { ProjectsModule } from '../projects/projects.module';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { Event, EventSchema } from '../schemas/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Event.name, schema: EventSchema },
    ]),
    FilesModule,
    forwardRef(() => ProjectsModule),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
