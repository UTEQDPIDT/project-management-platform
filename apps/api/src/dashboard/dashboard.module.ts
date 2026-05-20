import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Event, EventSchema } from '../schemas/event.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  providers: [DashboardService],
  controllers: [DashboardController]
})
export class DashboardModule {}
