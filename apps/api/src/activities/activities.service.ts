import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Activity } from '../schemas/activities.schema';
import { Model } from 'mongoose';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
  ) {}

  async create(createActivityDto: CreateActivityDto, userId: string) {
    try {
      const createdActivity = await this.activityModel.create({
        ...createActivityDto,
        createdBy: userId,
      });
      return createdActivity;
    } catch (err: any) {
      throw new BadRequestException('Error al crear el producto' + err.message);
    }
  }

  findAll() {
    return this.activityModel.find().exec();
  }

  findOne(id: string) {
    const activity = this.activityModel.findById(id);
    if (!activity) {
      throw new NotFoundException(`Activity with ID: ${id} not found`);
    }
    return activity;
  }

  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
    userId: string,
  ) {
    try {
      const updatedActivity = this.activityModel.findByIdAndUpdate(id, {
        ...updateActivityDto,
        updatedBy: userId,
      });

      if (!updatedActivity) {
        throw new NotFoundException(`Activity with ID: ${id} not found`);
      }

      return updatedActivity;
    } catch (err: any) {
      throw new BadRequestException('Error updating activity' + err.message);
    }
  }

  remove(id: string) {
    const deletedActivity = this.activityModel.findByIdAndDelete(id);

    if (!deletedActivity) {
      throw new NotFoundException(`Activity with ID: ${id} not found`);
    }

    return deletedActivity;
  }
}
