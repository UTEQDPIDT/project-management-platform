import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Activity } from '../schemas/activities.schema';
import { ClientSession, Model } from 'mongoose';
import { FilesService } from '../files/files.service';
import { EntityType, Priority, Status } from '@repo/types';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    private readonly filesService: FilesService,
    @Inject(forwardRef(() => ProjectsService))
    private readonly projectsService: ProjectsService,
  ) {}

  async create(
    createActivityDto: CreateActivityDto,
    userId: string,
  ): Promise<Activity> {
    try {
      const createdActivity = new this.activityModel({
        ...createActivityDto,
        createdBy: userId,
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
// This method checks if an activity has at least one evidence file before allowing it to be marked as completed.
  private async ensureEvidenceBeforeComplete(activityId: string): Promise<void> {
    const hasEvidence = await this.filesService.activityHasEvidence(activityId);

    if (!hasEvidence) {
      throw new BadRequestException({
        code: 'ACTIVITY_EVIDENCE_REQUIRED',
        message:
          'No se puede completar la actividad sin evidencia. Adjunta al menos un archivo.',
      });
    }
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
// Check if the status is being updated to COMPLETED and if it was not already COMPLETED
    const isTransitionToCompleted =
      updateActivityDto.status === Status.COMPLETED &&
      activity.status !== Status.COMPLETED;

    if (isTransitionToCompleted) {
      await this.ensureEvidenceBeforeComplete(id);
    }

    const updatedActivity = await this.activityModel.findByIdAndUpdate(
      id,
      {
        ...updateActivityDto,
        updatedBy: userId,
      },
      { new: true },
    );

    if (activity.entityType === EntityType.PROJECT) {
      await this.projectsService.recomputeProjectStatus(
        activity.entityId.toString(),
      );
    }

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

    if (activity.entityType === EntityType.PROJECT) {
      const projectActivitiesCount = await this.activityModel.countDocuments({
        entityId: activity.entityId,
        entityType: EntityType.PROJECT,
      });

      if (projectActivitiesCount <= 3) {
        throw new BadRequestException(
          'El proyecto debe mantener al menos 3 actividades.',
        );
      }
    }

    await this.filesService.deleteFiles(files);

    await this.activityModel.findByIdAndDelete(id);

    if (activity.entityType === EntityType.PROJECT) {
      await this.projectsService.recomputeProjectStatus(
        activity.entityId.toString(),
      );
    }

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
