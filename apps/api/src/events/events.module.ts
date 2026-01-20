import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from '../schemas/event.schema';
import { FilesModule } from '../files/files.module';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    FilesModule,
    ActivitiesModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
