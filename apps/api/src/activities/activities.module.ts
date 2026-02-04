import { forwardRef, Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Activity, ActivitySchema } from '../schemas/activities.schema';
import { FilesModule } from '../files/files.module';
import { ActivityResourceInterceptor } from './interceptors/activity-resource.interceptor';
import { CaslModule } from '../casl/casl.module';
import { EventsModule } from '../events/events.module';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
    ]),
    CaslModule,
    UsersModule,
    forwardRef(() => FilesModule),
    forwardRef(() => EventsModule),
    forwardRef(() => ProjectsModule)
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivityResourceInterceptor],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
