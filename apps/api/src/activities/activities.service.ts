import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Activity } from '../schemas/activities.schema';
import { ClientSession, Model } from 'mongoose';
import { FilesService } from '../files/files.service';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    private readonly filesService: FilesService,
  ) {}

  async create(
    createActivityDto: CreateActivityDto,
    userId: string,
    session?: ClientSession,
  ): Promise<Activity> {
    try {
      const createdActivity = new this.activityModel({
        ...createActivityDto,
        createdBy: userId,
      });

      await createdActivity.save({ session });

      return createdActivity;
    } catch (err: any) {
      throw new BadRequestException(
        'Error al crear la actividad: ' + err.message,
      );
    }
  }

  async createOnBulk(createActivityDto: CreateActivityDto[], userId: string) {
    try {
      const activities = await this.activityModel.insertMany(
        createActivityDto.map((dto) => ({
          ...dto,
          createdBy: userId,
        })),
      );

      return activities;
    } catch (err: any) {
      throw new BadRequestException('Error al crear actividades', err.message);
    }
  }

  async findAll() {
    return this.activityModel.find().exec();
  }

  async findOne(id: string) {
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
  ): Promise<Activity> {
    const activity = await this.activityModel.findById(id);

    if (!activity) {
      throw new NotFoundException(`Activity with ID: ${id} not found`);
    }

    const updatedActivity = await this.activityModel.findByIdAndUpdate(
      id,
      {
        ...updateActivityDto,
        updatedBy: userId,
      },
      { new: true },
    );

    return updatedActivity;
  }

  async removeFile(activityId: string, fileId: string, userId: string) {
    const activity = await this.activityModel.findById(activityId);
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${activityId} not found`);
    }

    if (!activity.files.includes(fileId)) {
      throw new BadRequestException('File does not belong to this activity');
    }

    await this.filesService.deleteFile(fileId);

    const updated = await this.activityModel.findByIdAndUpdate(
      activityId,
      {
        $pull: { files: fileId },
        updatedBy: userId,
      },
      { new: true },
    );

    return updated;
  }

  async remove(id: string) {
    const activity = await this.activityModel.findById(id);

    if (!activity) {
      throw new NotFoundException(`Activity with ID: ${id} not found`);
    }

    if (activity.files && activity.files.length > 0) {
      for (const fileId of activity.files) {
        await this.filesService.deleteFile(fileId.toString());
      }
    }

    const deletedActivity = await this.activityModel.findByIdAndDelete(id);

    return deletedActivity;
  }
}
