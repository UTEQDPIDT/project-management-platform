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
import { Priority } from '@repo/types';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    private readonly filesService: FilesService,
  ) {}

  async create(
    createActivityDto: CreateActivityDto,
    userId: string,
    options?: {
      session?: ClientSession;
      projectId?: string;
      eventId?: string;
    },
  ): Promise<Activity> {
    try {
      const createdActivity = new this.activityModel({
        ...createActivityDto,
        createdBy: userId,
        projectId: options?.projectId,
        eventId: options?.eventId,
      });

      await createdActivity.save({ session: options?.session });

      return createdActivity;
    } catch (err: any) {
      throw new BadRequestException(
        'Error al crear la actividad: ' + err.message,
      );
    }
  }

  async createOnBulk(
    createActivityDto: { name: string }[],
    userId: string,
    session?: ClientSession,
    projectId?: string,
  ) {
    try {
      const activities = await this.activityModel.insertMany(
        createActivityDto.map((activity) => ({
          name: activity.name,
          createdBy: userId,
          projectId,
          priority: Priority.LOW,
        })),
        { session },
      );

      return activities;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  async findAll(): Promise<Activity[]> {
    return this.activityModel.find().exec();
  }

  async findOne(id: string): Promise<Activity> {
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

    await this.activityModel.findByIdAndUpdate(
      activityId,
      {
        $pull: { files: fileId },
        updatedBy: userId,
      },
      { new: true },
    );

    return {
      id: activityId,
      message: 'File removed successfully from activity',
    };
  }

  async remove(id: string): Promise<{ id: string; message: string }> {
    const activity = await this.activityModel.findById(id);

    if (!activity) {
      throw new NotFoundException(`Activity with ID: ${id} not found`);
    }

    if (activity.files && activity.files.length > 0) {
      for (const fileId of activity.files) {
        await this.filesService.deleteFile(fileId.toString());
      }
    }

    await this.activityModel.findByIdAndDelete(id);

    return { id, message: 'Activity deleted successfully' };
  }

  async deleteManyByProject(projectId: string, session: ClientSession) {
    await this.activityModel.deleteMany({ projectId }, { session });
  }

  async deleteManyByEvent(eventId: string, session: ClientSession) {
    await this.activityModel.deleteMany({ eventId }, { session });
  }
}
