import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from '../schemas/events.schema';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
      MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
      FilesModule
    ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
