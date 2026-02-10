import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Activity } from '../schemas/activities.schema';
import { ClientSession, Model } from 'mongoose';
import { FilesService } from '../files/files.service';
import { EntityType, Priority } from '@repo/types';
import { ForbiddenError } from '@casl/ability';
import { AbilityFactory, Action } from '../casl/ability.factory';
import { EventsService } from '../events/events.service';
import { ProjectsService } from '../projects/projects.service';
import { User } from '../schemas';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    @Inject(forwardRef(() => FilesService))
    private readonly filesService: FilesService,
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
    @Inject(forwardRef(() => ProjectsService))
    private readonly projectsService: ProjectsService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

async create(
  createActivityDto: CreateActivityDto,
  user: User,
): Promise<Activity> {
  try {
    const ability = this.abilityFactory.defineAbility(user);

     //EVENT activity
    if (createActivityDto.entityType === EntityType.EVENT) {
      const event = await this.eventsService.findOne(createActivityDto.entityId.toString());

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      ForbiddenError.from(ability).throwUnlessCan(
        Action.UpdateContent,
        event,
      );
    }

    //PROJECT activity
    if (createActivityDto.entityType === EntityType.PROJECT) {
      const project = await this.projectsService.findOne(createActivityDto.entityId.toString());

      if (!project || !project.team) {
        throw new NotFoundException('Project or team not found');
      }

      ForbiddenError.from(ability).throwUnlessCan(
        Action.UpdateContent,
        project.team,
      );
    }

    const createdActivity = new this.activityModel({
      ...createActivityDto,
      createdBy: user._id || user.id,
    });

    await createdActivity.save();
    return createdActivity;
  } catch (err: any) {
    throw new BadRequestException(err.message);
  }
}


  async createOnBulk(
    createActivityDto: { name: string }[],
    userId: string,
    entityId: string,
    entityType: EntityType,
    session?: ClientSession,
  ) {
    try {
      const activities = await this.activityModel.insertMany(
        createActivityDto.map((activity) => ({
          name: activity.name,
          createdBy: userId,
          entityId,
          entityType,
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

  async findByEntityId(entityId: string): Promise<Activity[]> {
    const activities = await this.activityModel
      .find({ entityId })
      .populate('createdBy')
      .populate('assignees')
      .exec();
    return activities;
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityModel.findById(id).exec();
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

  async addAssignee(activityId: string, userId: string, updaterId: string) {
    try {
      await this.activityModel.findByIdAndUpdate(
        { _id: activityId },
        { $addToSet: { assignees: userId }, $set: { updatedBy: updaterId } },
      );
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  async removeAssignee(activityId: string, userId: string, updaterId: string) {
    try {
      await this.activityModel.findByIdAndUpdate(
        { _id: activityId },
        { $pull: { assignees: userId }, $set: { updatedBy: updaterId } },
      );
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  async remove(id: string): Promise<{ id: string; message: string }> {
    const activity = await this.activityModel.findById(id);

    if (!activity) {
      throw new NotFoundException(`Activity with ID: ${id} not found`);
    }

    const files = await this.filesService.findFilesForEntity(
      activity._id.toString(),
    );

    await this.filesService.deleteFiles(files);

    await this.activityModel.findByIdAndDelete(id);

    return { id, message: 'Activity deleted successfully' };
  }

  async deleteManyByEntity(entityId: string, session: ClientSession) {
    const activities = await this.activityModel.find({ entityId }).exec();

    const filesPerActivity = await Promise.all(
      activities.map((a) =>
        this.filesService.findFilesForEntity(a._id.toString()),
      ),
    );

    const files = filesPerActivity.flat();

    await this.filesService.deleteFiles(files);

    await this.activityModel.deleteMany({ entityId }, { session });
  }
}
