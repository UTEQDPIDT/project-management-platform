import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Project } from '../schemas/project.schema';
import { User } from '../schemas/user.schema';
import { Connection, Model, Types } from 'mongoose';
import { FilesService } from '../files/files.service';
import { ProductsService } from '../products/products.service';
import { ActivitiesService } from '../activities/activities.service';
import {
  EntityType,
  ProjectStatus,
  Status,
  ProjectValidation,
} from '@repo/types';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly productService: ProductsService,
    @Inject(forwardRef(() => ActivitiesService))
    private readonly activitiesService: ActivitiesService,
    private readonly filesService: FilesService,
  ) {}

  private async getValidationPermissions(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('canValidateProjets canCloseProject');

    if (!user) {
      throw new NotFoundException(`User with ID: ${userId} not found`);
    }

    return {
      canValidate: Boolean(user.get('canValidateProjets')),
      canClose: Boolean(user.get('canCloseProject')),
    };
  }

  /**
   * Validates that the project contains the minimum required activities.
   * @param activities Array of activities to validate.
   * @private
   */
  private validateActivities(activities?: { name: string }[]) {
    if (!activities || activities.length < 3) {
      throw new BadRequestException('The project must have at least 3 activities.');
    }

    if (activities.some((activity) => !activity.name || !activity.name.trim())) {
      throw new BadRequestException('Each activity must have a valid name.');
    }
  }

  /**
   * Returns the initial project status.
   * @private
   */
  private getInitialProjectStatus(): ProjectStatus {
    return ProjectStatus.PENDING;
  }

  /**
   * Determines the overall project status based on the individual status of its activities.
   * @param activities Array of project activities.
   * @private
   */
  private getProjectStatusFromActivities(
    activities: Array<{ status: Status }>,
  ): ProjectStatus {
    if (activities.length < 3) {
      throw new BadRequestException(
        'The project must have at least 3 activities.',
      );
    }

    if (activities.every((activity) => activity.status === Status.PENDING)) {
      return ProjectStatus.PENDING;
    }

    if (
      activities.every((activity) => activity.status === Status.COMPLETED)
    ) {
      return ProjectStatus.COMPLETED;
    }

    return ProjectStatus.IN_PROGRESS;
  }

  /**
   * Recalculates and updates the project status based on its current activities.
   * Prevents changes if the project has already been finalized and closed.
   * @param projectId The unique identifier of the project.
   */
  async recomputeProjectStatus(projectId: string): Promise<ProjectStatus> {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException(`Project with ID: ${projectId} not found`);
    }

    if (project.get('validationStatus') === ProjectValidation.FINAL_VALIDATION) {
      throw new ForbiddenException('Cannot change the status of a project that has been validated and closed.');
    }

    const activities = await this.activitiesService.findByEntityId(projectId);
    const status = this.getProjectStatusFromActivities(activities);

    await this.projectModel.findByIdAndUpdate(projectId, { status });

    return status;
  }

  /**
   * Creates a new project along with its activities inside a database transaction session.
   * @param dto Data transfer object containing project and activity details.
   * @param userId The ID of the user creating the project.
   */
  async create(dto: CreateProjectDto, userId: string): Promise<Project> {
    const session = await this.connection.startSession();
    session.startTransaction();

    const { activities, ...projectData } = dto;

    try {
      this.validateActivities(activities);
      const [project] = await this.projectModel.create(
        [
          {
            ...projectData,
            owner: userId,
            updatedBy: userId,
            status: this.getInitialProjectStatus(),
            validationStatus: null,
          },
        ],
        { session },
      );

      const projectId = project._id;

      await this.activitiesService.createOnBulk(
        activities,
        userId,
        projectId.toString(),
        EntityType.PROJECT,
        session,
      );

      await session.commitTransaction();

      return project;
    } catch (err: any) {
      await session.abortTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Retrieves all projects from the database with fully populated relationships.
   */
  async findAll() {
    return await this.projectModel
      .find()
      .populate('impactAreas')
      .populate('knowledgeAreas')
      .populate('prioritiesPND')
      .populate('sustainableObjectives')
      .populate('innovationLines')
      .populate('program')
      .populate({
        path: 'team',
        populate: [{ path: 'memberships.user' }],
      })
      .populate({ path: 'relatedProjects' })
      .populate('owner')
      .populate('updatedBy')
      .populate('firstValidatedBy')
      .populate('closedBy')
      .exec();
  }

  /**
   * Retrieves a single project by its ID with populated relationships.
   * @param id The unique identifier of the project.
   */
  async findOne(id: string) {
    const project = await this.projectModel
      .findById(id)
      .populate('impactAreas')
      .populate('knowledgeAreas')
      .populate('prioritiesPND')
      .populate('sustainableObjectives')
      .populate('innovationLines')
      .populate('program')
      .populate({
        path: 'team',
        populate: [{ path: 'memberships.user' }],
      })
      .populate({ path: 'relatedProjects' })
      .populate('owner')
      .populate('updatedBy')
      .populate('firstValidatedBy')
      .populate('closedBy');
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found.`);
    }

    return project;
  }

  /**
   * Retrieves all projects belonging to a specific owner.
   * @param ownerId The unique identifier of the owner user.
   */
  async findByOwner(ownerId: string) {
    return await this.projectModel
      .find({ owner: ownerId })
      .populate('impactAreas')
      .populate('knowledgeAreas')
      .populate('prioritiesPND')
      .populate('sustainableObjectives')
      .populate('innovationLines')
      .populate('program')
      .populate({
        path: 'team',
        populate: [{ path: 'memberships.user' }],
      })
      .populate({ path: 'relatedProjects' })
      .populate('owner')
      .populate('updatedBy')
      .populate('firstValidatedBy')
      .populate('closedBy');
  }

  /**
   * Retrieves all projects associated with a specific team.
   * @param teamId The unique identifier of the team.
   */
  async findByTeam(teamId: string) {
    return await this.projectModel.find({ team: teamId });
  }

  /**
   * Updates general project details.
   * Prevents updates if the project is locked under FINAL_VALIDATION.
   * @param id The unique identifier of the project.
   * @param updateProjectDto Data payload containing the updates.
   * @param userId The ID of the user performing the update.
   */
  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.projectModel.findById(id);

    if (!project) {
      throw new NotFoundException(`Project with ID: ${id} not found`);
    }

    if (project.get('validationStatus') === ProjectValidation.FINAL_VALIDATION) {
      throw new ForbiddenException('Cannot update a project that has been validated and closed.');
    }

    await this.projectModel.findByIdAndUpdate(id, {
      ...updateProjectDto,
      updatedBy: userId,
    });

    return { id, message: 'Project updated successfully' };
  }

  /**
   * Deletes a project and all its nested entities (files, products, activities) via transaction.
   * Blocks deletion if the project is locked under FINAL_VALIDATION.
   * @param projectId The unique identifier of the project to remove.
   */
  async remove(projectId: string) {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException(`Project with ID: ${projectId} not found`);
    }

    if (project.get('validationStatus') === ProjectValidation.FINAL_VALIDATION) {
      throw new ForbiddenException('Cannot delete a project that has been validated and closed.');
    }

    const files = await this.filesService.findFilesForEntity(
      project._id.toString(),
    );

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Delete files
      await this.filesService.deleteFiles(files);

      // Delete products
      await this.productService.deleteMany(projectId, session);

      // Delete activities
      await this.activitiesService.deleteManyByEntity(projectId, session);

      // Delete project
      await this.projectModel.findByIdAndDelete(projectId, session);

      await session.commitTransaction();

      return { message: 'Project deleted successfully' };
    } catch (err: any) {
      await session.abortTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await session.endSession();
    }
  }

  // =========================================================================
  // Project Validation Workflow (Simplified 2-Step Flow)
  // =========================================================================

  /**
   * Applies the first administrative validation level.
   * Demands the project to be explicitly marked as COMPLETED.
   * @param projectId The unique identifier of the project.
   * @param userId The ID of the administrative user applying the validation.
   */
  async applyFirstValidation(projectId: string, userId: string) {
    const permissions = await this.getValidationPermissions(userId);

    if (!permissions.canValidate) {
      throw new ForbiddenException('This user is not authorized to apply the first validation.');
    }

    const currentStatus = await this.recomputeProjectStatus(projectId);

    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException(`Project with ID: ${projectId} not found`);
    }

    if (currentStatus !== ProjectStatus.COMPLETED) {
      throw new BadRequestException(
        'The project must be in COMPLETED status (all activities finished) to initiate validations.',
      );
    }

    const currentValidationStatus = project.get('validationStatus');

    if (currentValidationStatus !== null && currentValidationStatus !== undefined) {
      throw new BadRequestException('The project has already passed the first validation level or is closed.');
    }

    await this.projectModel.findByIdAndUpdate(projectId, {
      validationStatus: ProjectValidation.FIRST_VALIDATION,
      firstValidatedBy: new Types.ObjectId(userId),
      updatedBy: userId,
    });

    return { id: projectId, message: 'First validation applied successfully' };
  }

  /**
   * Closes the project permanently, applying the FINAL_VALIDATION stage.
   * Requires the project to possess the FIRST_VALIDATION mark beforehand.
   * Locks down write permissions system-wide.
   * @param projectId The unique identifier of the project.
   * @param userId The ID of the final manager account closing the project.
   */
  async closeProject(projectId: string, userId: string) {
    const permissions = await this.getValidationPermissions(userId);

    if (!permissions.canClose) {
      throw new ForbiddenException('This user is not authorized to close projects.');
    }

    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException(`Project with ID: ${projectId} not found`);
    }

    const validationStatus = project.get('validationStatus');

    if (validationStatus === ProjectValidation.FINAL_VALIDATION) {
      throw new BadRequestException('The project is already closed.');
    }

    const currentStatus = await this.recomputeProjectStatus(projectId);

    if (currentStatus !== ProjectStatus.COMPLETED) {
      throw new BadRequestException('The project must be in COMPLETED status to be closed.');
    }

    const hasFirstValidation =
      validationStatus === ProjectValidation.FIRST_VALIDATION ||
      Boolean(project.get('firstValidatedBy'));

    if (!hasFirstValidation) {
      throw new BadRequestException('The project must pass the first validation level before it can be closed.');
    }

    await this.projectModel.findByIdAndUpdate(projectId, {
      status: ProjectStatus.CLOSED, 
      validationStatus: ProjectValidation.FINAL_VALIDATION, 
      closedBy: new Types.ObjectId(userId),
      updatedBy: userId,
    });

    return { id: projectId, message: 'Project closed successfully' };
  }

  /**
   * Reopens a locked project, restarting the entire validation flow.
   * Strictly enforces that ONLY the exact user who executed the close function can undo it.
   * @param projectId The unique identifier of the project.
   * @param userId The ID of the user requesting the reopen action.
   */
  async reopenProject(projectId: string, userId: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException(`Project with ID: ${projectId} not found`);

    if (project.get('validationStatus') !== ProjectValidation.FINAL_VALIDATION) {
      throw new BadRequestException('The project is not in FINAL_VALIDATION status.');
    }

    const closedByRaw = project.get('closedBy');
    const closedById = closedByRaw instanceof Types.ObjectId 
      ? closedByRaw.toString() 
      : closedByRaw?._id?.toString() || closedByRaw?.toString();

    if (closedById !== userId) {
      throw new ForbiddenException('Only the exact user account that closed this project is authorized to reopen it.');
    }

    await this.projectModel.findByIdAndUpdate(projectId, {
      status: ProjectStatus.COMPLETED, 
      validationStatus: null,
      closedBy: null,
      firstValidatedBy: null,
      updatedBy: userId,
    });

    return { id: projectId, message: 'Project reopened successfully. Validation workflow restarted.' };
  }
}