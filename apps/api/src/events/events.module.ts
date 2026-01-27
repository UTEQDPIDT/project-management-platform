import { forwardRef, Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from '../schemas/event.schema';
import { FilesModule } from '../files/files.module';
import { ActivitiesModule } from '../activities/activities.module';
import { CaslModule } from '../casl/casl.module';
import { EventResourceInterceptor } from './interceptors/event-resource.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    forwardRef(() => FilesModule),
    forwardRef(() => ActivitiesModule),
    CaslModule
  ],
  controllers: [EventsController],
  providers: [EventsService, EventResourceInterceptor],
  exports: [EventsService],
})
export class EventsModule {}
