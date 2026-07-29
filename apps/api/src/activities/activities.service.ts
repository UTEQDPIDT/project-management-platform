import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  HttpException,
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
import {
  EntityType,
  Priority,
  ProjectStatus,
  ProjectValidation,
  Status,
  UserRole,
} from '@repo/types';
import { ProjectsService } from '../projects/projects.service';
import { Project } from '../schemas/project.schema';
import { Event } from '../schemas/event.schema';
import { AccessDeniedException } from '../common/security/access-denied.exception';
import { AccessDeniedReason } from '../common/security/access-denied-reason.enum';
import { hasProjectCollaborationAccess } from '../common/security/project-collaboration.helper';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private readonly filesService: FilesService,
    @Inject(forwardRef(() => ProjectsService))
    private readonly projectsService: ProjectsService,
  ) {}

  private toId(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof (value as { toString?: () => string }).toString === 'function') {
      return (value as { toString: () => string }).toString();
    }

    return null;
  }

  private async ensureCanDeleteActivity(
    activity: Activity,
    actorId: string,
    actorRole: UserRole,
  ) {
    if (actorRole === UserRole.ADMIN) {
      return;
    }

    if (activity.entityType === EntityType.PROJECT) {
      await this.ensureCanManageProjectActivities(
        activity.entityId.toString(),
        actorId,
        actorRole,
        activity._id.toString(),
      );

      return;
    }

    if (activity.entityType === EntityType.EVENT) {
      const event = await this.eventModel.findById(activity.entityId).select('createdBy');

      if (!event) {
        throw new NotFoundException(
          `Event with ID: ${activity.entityId.toString()} not found`,
        );
      }

      const eventOwnerId = this.toId(event.createdBy);

      if (!eventOwnerId) {
        throw new AccessDeniedException({
          reason: AccessDeniedReason.EVENT_OWNER_MISSING,
          message: 'Event owner is not defined.',
          resourceType: 'event',
          resourceId: activity.entityId.toString(),
          actorId,
          actorRole,
        });
      }

      if (eventOwnerId !== actorId) {
        throw new AccessDeniedException({
          reason: AccessDeniedReason.ACTIVITY_DELETE_EVENT_NOT_OWNER,
          message: 'You are not allowed to delete activities from this event.',
          resourceType: 'activity',
          resourceId: activity._id.toString(),
          actorId,
          actorRole,
        });
      }

      return;
    }

    const createdById = this.toId(activity.createdBy);

    if (!createdById) {
      throw new AccessDeniedException({
        reason: AccessDeniedReason.ACTIVITY_OWNER_MISSING,
        message: 'Activity owner is not defined.',
        resourceType: 'activity',
        resourceId: activity._id.toString(),
        actorId,
        actorRole,
      });
    }

    if (createdById !== actorId) {
      throw new AccessDeniedException({
        reason: AccessDeniedReason.ACTIVITY_DELETE_NOT_OWNER,
        message: 'You are not allowed to delete this activity.',
        resourceType: 'activity',
        resourceId: activity._id.toString(),
        actorId,
        actorRole,
      });
    }
  }

  private async ensureProjectIsWritable(projectId: string) {
    const project = await this.projectModel.findById(projectId).select('status validationStatus');

    if (!project) {
      throw new NotFoundException(`Project with ID: ${projectId} not found`);
    }

    if (
      project.status === ProjectStatus.CLOSED ||
      project.validationStatus === ProjectValidation.FINAL_VALIDATION
    ) {
      throw new ForbiddenException('Cannot create activities for a closed project.');
    }
  }

  private async ensureCanManageProjectActivities(
    projectId: string,
    actorId: string,
    actorRole: UserRole,
    resourceId: string,
  ) {
    const project = await this.projectModel
      .findById(projectId)
      .select('owner team status validationStatus')
      .populate({ path: 'team', select: 'memberships' });

    if (!project) {
      throw new NotFoundException(`Project with ID: ${projectId} not found`);
    }

    if (
      project.status === ProjectStatus.CLOSED ||
      project.validationStatus === ProjectValidation.FINAL_VALIDATION
    ) {
      throw new ForbiddenException('Cannot create activities for a closed project.');
    }

    if (hasProjectCollaborationAccess(project, actorId, actorRole, (value) => this.toId(value))) {
      return;
    }

    throw new AccessDeniedException({
      reason: AccessDeniedReason.ACTIVITY_PROJECT_ACCESS_FORBIDDEN,
      message: 'You are not allowed to manage activities for this project.',
      resourceType: 'activity',
      resourceId,
      actorId,
      actorRole,
    });
  }

  async create(
    createActivityDto: CreateActivityDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Activity> {
    try {
      if (createActivityDto.entityType === EntityType.PROJECT) {
        await this.ensureCanManageProjectActivities(
          createActivityDto.entityId.toString(),
          userId,
          userRole,
          createActivityDto.entityId.toString(),
        );
      }

      const createdActivity = new this.activityModel({
        ...createActivityDto,
        createdBy: userId,
      });

      await createdActivity.save();

      return createdActivity;
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }
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
    userRole: UserRole,
  ) {
    const activity = await this.activityModel.findById(id);

    if (!activity) {
      throw new NotFoundException(`Activity with ID: ${id} not found`);
    }

    if (activity.entityType === EntityType.PROJECT) {
      await this.ensureCanManageProjectActivities(
        activity.entityId.toString(),
        userId,
        userRole,
        id,
      );
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

  async addAssignee(
    activityId: string,
    userId: string,
    updaterId: string,
    updaterRole: UserRole,
  ) {
    try {
      const activity = await this.activityModel.findById(activityId);

      if (!activity) {
        throw new NotFoundException(`Activity with ID: ${activityId} not found`);
      }

      if (activity.entityType === EntityType.PROJECT) {
        await this.ensureCanManageProjectActivities(
          activity.entityId.toString(),
          updaterId,
          updaterRole,
          activityId,
        );
      }

      await this.activityModel.findByIdAndUpdate(
        { _id: activityId },
        { $addToSet: { assignees: userId }, $set: { updatedBy: updaterId } },
      );
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new BadRequestException(err.message);
    }
  }

  async removeAssignee(
    activityId: string,
    userId: string,
    updaterId: string,
    updaterRole: UserRole,
  ) {
    try {
      const activity = await this.activityModel.findById(activityId);

      if (!activity) {
        throw new NotFoundException(`Activity with ID: ${activityId} not found`);
      }

      if (activity.entityType === EntityType.PROJECT) {
        await this.ensureCanManageProjectActivities(
          activity.entityId.toString(),
          updaterId,
          updaterRole,
          activityId,
        );
      }

      await this.activityModel.findByIdAndUpdate(
        { _id: activityId },
        { $pull: { assignees: userId }, $set: { updatedBy: updaterId } },
      );
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new BadRequestException(err.message);
    }
  }

  async remove(
    id: string,
    actorId: string,
    actorRole: UserRole,
  ): Promise<{ id: string; message: string }> {
    const activity = await this.activityModel.findById(id);

    if (!activity) {
      throw new NotFoundException(`Activity with ID: ${id} not found`);
    }

    await this.ensureCanDeleteActivity(activity, actorId, actorRole);

    if (activity.entityType === EntityType.PROJECT) {
      await this.ensureProjectIsWritable(activity.entityId.toString());
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

    await this.filesService.deleteFilesForResource(files);

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

    await this.filesService.deleteFilesForResource(files);

    await this.activityModel.deleteMany({ entityId }, { session });
  }
}
