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
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Project } from '../schemas/project.schema';
import { User } from '../schemas/user.schema';
import { Team } from '../schemas/team.schema';
import { Connection, Model, Types } from 'mongoose';
import { FilesService } from '../files/files.service';
import { ProductsService } from '../products/products.service';
import { ActivitiesService } from '../activities/activities.service';
import {
  EntityType,
  ProjectStatus,
  Status,
  ProjectValidation,
  UserRole,
} from '@repo/types';
import { AccessDeniedException } from '../common/security/access-denied.exception';
import { AccessDeniedReason } from '../common/security/access-denied-reason.enum';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Team.name) private teamModel: Model<Team>,
    private readonly productService: ProductsService,
    @Inject(forwardRef(() => ActivitiesService))
    private readonly activitiesService: ActivitiesService,
    private readonly filesService: FilesService,
  ) {}

  private toId(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (
      typeof value === 'object' &&
      '_id' in (value as Record<string, unknown>)
    ) {
      const nestedId = (value as { _id: unknown })._id;
      if (nestedId !== value) {
        return this.toId(nestedId);
      }
    }

    if (typeof value === 'object') {
      const objectIdLike = value as {
        toHexString?: () => string;
        toString?: () => string;
      };

      if (typeof objectIdLike.toHexString === 'function') {
        return objectIdLike.toHexString();
      }

      if (typeof objectIdLike.toString === 'function') {
        const normalized = objectIdLike.toString().trim();
        const looksLikeSerializedDoc =
          normalized.startsWith('{') || normalized.includes('\n');

        if (normalized && normalized !== '[object Object]' && !looksLikeSerializedDoc) {
          return normalized;
        }
      }
    }

    return null;
  }

  private async getValidationPermissions(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('canValidateElements canCloseElements');

    if (!user) {
      throw new NotFoundException(`User with ID: ${userId} not found`);
    }

    return {
      canValidate: Boolean(user.get('canValidateElements')),
      canClose: Boolean(user.get('canCloseElements')),
    };
  }

  private activeMembershipMatch(userId: string) {
    return {
      $elemMatch: {
        user: userId,
        $or: [
          { status: 'ACTIVE' },
          { status: { $regex: /^\s*active\s*$/i } },
          { status: { $exists: false } },
        ],
      },
    };
  }

  private async getAccessibleTeamMemberships(userId: string) {
    const teams = await this.teamModel
      .find({
        memberships: this.activeMembershipMatch(userId),
      })
      .select('_id memberships')
      .exec();

    return teams.flatMap((team) =>
      team.memberships
        .filter((membership) =>
          this.toId(membership.user) === userId &&
          (membership.status === undefined ||
            (typeof membership.status === 'string' &&
              membership.status.trim().toUpperCase() === 'ACTIVE')),
        )
        .map((membership) => ({
          team: team._id,
          excludedTeamMemberships: { $ne: membership._id },
        })),
    );
  }

  private async getProjectVisibilityFilter(actorId: string, actorRole: UserRole) {
    if (actorRole === UserRole.ADMIN) {
      const permissions = await this.getValidationPermissions(actorId);
      return permissions.canClose ? {} : { isHidden: { $ne: true } };
    }

    return {
      $or: [{ owner: actorId }, ...await this.getAccessibleTeamMemberships(actorId)],
    };
  }

  private async ensureCanReadProject(
    project: Project,
    actorId: string,
    actorRole: UserRole,
  ) {
    if (actorRole === UserRole.ADMIN) {
      return;
    }

    const ownerId = this.toId(project.owner);

    if (ownerId === actorId) {
      return;
    }

    const projectTeamId = this.toId(project.team);

    if (!projectTeamId) {
      throw new AccessDeniedException({
        reason: AccessDeniedReason.PROJECT_VIEW_FORBIDDEN,
        message: 'You are not allowed to view this project.',
        resourceType: 'project',
        resourceId: project._id.toString(),
        actorId,
        actorRole,
      });
    }

    const isActiveTeamMember = await this.teamModel.exists({
      _id: projectTeamId,
      memberships: {
        $elemMatch: {
          ...this.activeMembershipMatch(actorId).$elemMatch,
          _id: { $nin: project.excludedTeamMemberships ?? [] },
        },
      },
    });

    if (isActiveTeamMember) {
      return;
    }

    throw new AccessDeniedException({
      reason: AccessDeniedReason.PROJECT_VIEW_FORBIDDEN,
      message: 'You are not allowed to view this project.',
      resourceType: 'project',
      resourceId: project._id.toString(),
      actorId,
      actorRole,
    });
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
   * Returns the initial validation status for a new project.
   * @private
   */
  private getInitialProjectValidation(): ProjectValidation {
    return ProjectValidation.UNDER_REVIEW;
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
            validationStatus: this.getInitialProjectValidation(),
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
  async findAll(actorId: string, actorRole: UserRole) {
    const queryFilter = await this.getProjectVisibilityFilter(actorId, actorRole);

    return await this.projectModel
      .find(queryFilter)
      .populate('impactAreas')
      .populate('knowledgeAreas')
      .populate('prioritiesPND')
      .populate('sustainableObjectives')
      .populate('innovationLines')
      .populate('innovationLinesSubcategories')
      .populate('program')
      .populate({
        path: 'team',
        populate: [{ path: 'memberships.user' }],
      })
      .populate({ path: 'relatedProjects', match: queryFilter })
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
  async findOne(id: string, actorId: string, actorRole: UserRole) {
    const relatedFilter = await this.getProjectVisibilityFilter(actorId, actorRole);
    const project = await this.projectModel
      .findById(id)
      .populate('impactAreas')
      .populate('knowledgeAreas')
      .populate('prioritiesPND')
      .populate('sustainableObjectives')
      .populate('innovationLines')
      .populate('innovationLinesSubcategories')
      .populate('program')
      .populate({
        path: 'team',
        populate: [{ path: 'memberships.user' }],
      })
      .populate({ path: 'relatedProjects', match: relatedFilter })
      .populate('owner')
      .populate('updatedBy')
      .populate('firstValidatedBy')
      .populate('closedBy');
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found.`);
    }

    if (actorRole === UserRole.ADMIN && (project as unknown as { isHidden?: boolean }).isHidden) {
      const permissions = await this.getValidationPermissions(actorId);
      if (!permissions.canClose) {
        throw new NotFoundException(`Project with ID ${id} not found.`);
      }
    }

    await this.ensureCanReadProject(project, actorId, actorRole);

    return project;
  }

  /**
   * Retrieves all projects belonging to a specific owner.
   * El ocultamiento de proyectos no aplica aquí: el dueño siempre ve sus propios proyectos.
   * @param ownerId The unique identifier of the owner user.
   */
  async findByOwner(ownerId: string, actorRole: UserRole) {
    const relatedFilter = await this.getProjectVisibilityFilter(ownerId, actorRole);
    return await this.projectModel
      .find({ owner: ownerId })
      .populate('impactAreas')
      .populate('knowledgeAreas')
      .populate('prioritiesPND')
      .populate('sustainableObjectives')
      .populate('innovationLines')
      .populate('innovationLinesSubcategories')
      .populate('program')
      .populate({
        path: 'team',
        populate: [{ path: 'memberships.user' }],
      })
      .populate({ path: 'relatedProjects', match: relatedFilter })
      .populate('owner')
      .populate('updatedBy')
      .populate('firstValidatedBy')
      .populate('closedBy');
  }

  /**
   * Retrieves all projects associated with a specific team.
   * @param teamId The unique identifier of the team.
   */
  async findByTeam(teamId: string, actorId: string, actorRole: UserRole) {
    if (actorRole !== UserRole.ADMIN) {
      const canReadTeam = await this.teamModel.exists({
        _id: teamId,
        memberships: this.activeMembershipMatch(actorId),
      });

      if (!canReadTeam) {
        throw new AccessDeniedException({
          reason: AccessDeniedReason.PROJECT_VIEW_FORBIDDEN,
          message: 'You are not allowed to view projects from this team.',
          resourceType: 'project-team',
          resourceId: teamId,
          actorId,
          actorRole,
        });
      }
    }

    const queryFilter: Record<string, unknown> = { team: teamId };
    if (actorRole === UserRole.ADMIN) {
      // El ocultamiento de proyectos solo aplica a la vista de administradores.
      const permissions = await this.getValidationPermissions(actorId);
      if (!permissions.canClose) {
        queryFilter.isHidden = { $ne: true };
      }
    } else {
      const memberships = await this.getAccessibleTeamMemberships(actorId);
      queryFilter.$or = [
        { owner: actorId },
        ...memberships.filter((membership) => this.toId(membership.team) === teamId),
      ];
    }

    return await this.projectModel.find(queryFilter);
  }

  /**
   * Updates general project details.
   * Prevents updates if the project is locked under FINAL_VALIDATION.
   * @param id The unique identifier of the project.
   * @param updateProjectDto Data payload containing the updates.
   * @param userId The ID of the user performing the update.
   */
  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
    userRole: UserRole,
  ) {
    const project = await this.projectModel.findById(id);

    if (!project) {
      throw new NotFoundException(`Project with ID: ${id} not found`);
    }

    if (project.get('validationStatus') === ProjectValidation.FINAL_VALIDATION) {
      throw new ForbiddenException('Cannot update a project that has been validated and closed.');
    }

    const ownerId = this.toId(project.owner);

    if (!ownerId) {
      throw new AccessDeniedException({
        reason: AccessDeniedReason.PROJECT_OWNER_MISSING,
        message: 'Project owner is not defined.',
        resourceType: 'project',
        resourceId: id,
        actorId: userId,
        actorRole: userRole,
      });
    }

    if (userRole !== UserRole.ADMIN && ownerId !== userId) {
      throw new AccessDeniedException({
        reason: AccessDeniedReason.PROJECT_UPDATE_NOT_OWNER,
        message: 'You are not allowed to update this project.',
        resourceType: 'project',
        resourceId: id,
        actorId: userId,
        actorRole: userRole,
      });
    }

    // Validate the resulting date range (merging the payload with stored values)
    const start = updateProjectDto.startDate ?? project.startDate;
    const end = updateProjectDto.endDate ?? project.endDate;

    if (start && end && new Date(end).getTime() < new Date(start).getTime()) {
      throw new BadRequestException(
        'La fecha de término no puede ser anterior a la fecha de inicio',
      );
    }

    await this.projectModel.findByIdAndUpdate(id, {
      ...updateProjectDto,
      ...(updateProjectDto.team !== undefined &&
      this.toId(updateProjectDto.team) !== this.toId(project.team)
        ? { excludedTeamMemberships: [] }
        : {}),
      updatedBy: userId,
    });

    return { id, message: 'Project updated successfully' };
  }

  async updateMember(
    id: string,
    dto: UpdateProjectMemberDto,
    actorId: string,
    actorRole: UserRole,
  ) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID: ${id} not found`);
    }
    if (actorRole !== UserRole.ADMIN && this.toId(project.owner) !== actorId) {
      throw new ForbiddenException('No tienes permiso para modificar los participantes.');
    }
    if (project.validationStatus === ProjectValidation.FINAL_VALIDATION ||
        project.status === ProjectStatus.CLOSED) {
      throw new ForbiddenException('No se pueden modificar los participantes de un proyecto cerrado.');
    }
    const teamId = this.toId(project.team);
    const team = teamId
      ? await this.teamModel.findById(teamId).select('memberships')
      : null;
    const activeMemberships = (team?.memberships ?? []).filter(
      (membership) =>
        membership.status === undefined ||
        (typeof membership.status === 'string' &&
          membership.status.trim().toUpperCase() === 'ACTIVE'),
    );
    const membershipId = new Types.ObjectId(dto.membershipId);
    const membership = activeMemberships.find((item) => item._id.equals(membershipId));
    if (!membership) {
      throw new BadRequestException('El participante no pertenece al equipo activo del proyecto.');
    }
    const ownerId = this.toId(project.owner);
    if (!dto.selected && ownerId && this.toId(membership.user) === ownerId) {
      throw new BadRequestException(
        'El creador del proyecto debe permanecer seleccionado.',
      );
    }
    const otherActiveMembershipIds = activeMemberships
      .filter((membership) => !membership._id.equals(membershipId))
      .map((membership) => membership._id);
    const ownerMembershipIds = activeMemberships
      .filter((item) => ownerId && this.toId(item.user) === ownerId)
      .map((item) => item._id);
    const updated = await this.projectModel.findOneAndUpdate(
      {
        _id: id,
        team: teamId,
        validationStatus: { $ne: ProjectValidation.FINAL_VALIDATION },
        status: { $ne: ProjectStatus.CLOSED },
        owner: project.owner,
        ...(!dto.selected
          ? {
              $or: [
                { excludedTeamMemberships: membershipId },
                {
                  $expr: {
                    $gt: [
                      {
                        $size: {
                          $setDifference: [
                            otherActiveMembershipIds,
                            {
                              $setDifference: [
                                { $ifNull: ['$excludedTeamMemberships', []] },
                                ownerMembershipIds,
                              ],
                            },
                          ],
                        },
                      },
                      0,
                    ],
                  },
                },
              ],
            }
          : {}),
      },
      dto.selected
        ? { $pull: { excludedTeamMemberships: membershipId } }
        : { $addToSet: { excludedTeamMemberships: membershipId } },
      { new: true },
    );
    if (!updated) {
      if (!dto.selected) {
        const currentProject = await this.projectModel.findById(id);
        if (
          currentProject &&
          this.toId(currentProject.team) === teamId &&
          this.toId(currentProject.owner) === ownerId &&
          currentProject.validationStatus !== ProjectValidation.FINAL_VALIDATION &&
          currentProject.status !== ProjectStatus.CLOSED &&
          (actorRole === UserRole.ADMIN || this.toId(currentProject.owner) === actorId)
        ) {
          throw new BadRequestException(
            'Debe haber al menos un integrante seleccionado en el proyecto.',
          );
        }
      }
      throw new ForbiddenException('El proyecto cambió; vuelve a cargarlo e inténtalo de nuevo.');
    }
    return { id, excludedTeamMemberships: updated.excludedTeamMemberships };
  }

  /**
   * Deletes a project and all its nested entities (files, products, activities) via transaction.
   * Blocks deletion if the project is locked under FINAL_VALIDATION.
   * @param projectId The unique identifier of the project to remove.
   */
  async remove(projectId: string, actorId: string, actorRole: UserRole) {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException(`Project with ID: ${projectId} not found`);
    }

    if (project.get('validationStatus') === ProjectValidation.FINAL_VALIDATION) {
      throw new ForbiddenException('Cannot delete a project that has been validated and closed.');
    }

    const ownerId = this.toId(project.owner);

    if (!ownerId) {
      throw new AccessDeniedException({
        reason: AccessDeniedReason.PROJECT_OWNER_MISSING,
        message: 'Project owner is not defined.',
        resourceType: 'project',
        resourceId: projectId,
        actorId,
        actorRole,
      });
    }

    if (actorRole !== UserRole.ADMIN && ownerId !== actorId) {
      throw new AccessDeniedException({
        reason: AccessDeniedReason.PROJECT_DELETE_NOT_OWNER,
        message: 'You are not allowed to delete this project.',
        resourceType: 'project',
        resourceId: projectId,
        actorId,
        actorRole,
      });
    }

    const files = await this.filesService.findFilesForEntity(
      project._id.toString(),
    );

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Delete files
      await this.filesService.deleteFilesForResource(files);

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
   * Projects can be validated as soon as they are uploaded.
   * @param projectId The unique identifier of the project.
   * @param userId The ID of the administrative user applying the validation.
   */
  async applyFirstValidation(projectId: string, userId: string) {
    const permissions = await this.getValidationPermissions(userId);

    if (!permissions.canValidate) {
      throw new ForbiddenException('This user is not authorized to apply the first validation.');
    }

    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException(`Project with ID: ${projectId} not found`);
    }

    const currentValidationStatus = project.get('validationStatus');

    const isUnvalidated =
      currentValidationStatus === ProjectValidation.UNDER_REVIEW ||
      currentValidationStatus === null ||
      currentValidationStatus === undefined;

    if (!isUnvalidated) {
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
   * Cancels the first validation stage and restores the activity-derived status.
   * @param projectId The unique identifier of the project.
   * @param userId The ID of the administrative user cancelling the first validation.
   */
  async cancelFirstValidation(projectId: string, userId: string) {
    const permissions = await this.getValidationPermissions(userId);

    if (!permissions.canValidate) {
      throw new ForbiddenException('This user is not authorized to cancel the first validation.');
    }

    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException(`Project with ID: ${projectId} not found`);
    }

    const validationStatus = project.get('validationStatus');

    if (validationStatus !== ProjectValidation.FIRST_VALIDATION) {
      throw new BadRequestException('The project is not in FIRST_VALIDATION status.');
    }

    await this.recomputeProjectStatus(projectId);

    await this.projectModel.findByIdAndUpdate(projectId, {
      validationStatus: ProjectValidation.UNDER_REVIEW,
      firstValidatedBy: null,
      closedBy: null,
      updatedBy: userId,
    });

    return { id: projectId, message: 'First validation cancelled successfully' };
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

    const firstValidatedByRaw = project.get('firstValidatedBy');
    const firstValidatedBy =
      firstValidatedByRaw?._id ?? firstValidatedByRaw ?? null;

    await this.projectModel.findByIdAndUpdate(projectId, {
      status: ProjectStatus.COMPLETED,
      validationStatus: ProjectValidation.FIRST_VALIDATION, //RESET ONLY TO FIRST_VALIDATION INSTEAD OF ALL THE WAY BACK TO UNDER_REVIEW
      firstValidatedBy,
      closedBy: null,
      updatedBy: userId,
    });

    return { id: projectId, message: 'Project reopened successfully. Validation workflow restarted.' };
  }

  /**
   * Hides a project from users who lack the close-project permission.
   * Restricted to users authorized to close projects.
   * @param projectId The unique identifier of the project.
   * @param userId The ID of the user hiding the project.
   */
  async hideProject(projectId: string, userId: string) {
    const permissions = await this.getValidationPermissions(userId);

    if (!permissions.canClose) {
      throw new ForbiddenException('This user is not authorized to hide projects.');
    }

    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID: ${projectId} not found`);
    }

    if (project.get('isHidden')) {
      throw new BadRequestException('The project is already hidden.');
    }

    await this.projectModel.findByIdAndUpdate(projectId, {
      isHidden: true,
      hiddenBy: new Types.ObjectId(userId),
      updatedBy: userId,
    });

    return { id: projectId, message: 'Project hidden successfully' };
  }

  /**
   * Reveals a previously hidden project.
   * Restricted to users authorized to close projects.
   * @param projectId The unique identifier of the project.
   * @param userId The ID of the user unhiding the project.
   */
  async unhideProject(projectId: string, userId: string) {
    const permissions = await this.getValidationPermissions(userId);

    if (!permissions.canClose) {
      throw new ForbiddenException('This user is not authorized to unhide projects.');
    }

    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID: ${projectId} not found`);
    }

    if (!project.get('isHidden')) {
      throw new BadRequestException('The project is not hidden.');
    }

    await this.projectModel.findByIdAndUpdate(projectId, {
      isHidden: false,
      hiddenBy: null,
      updatedBy: userId,
    });

    return { id: projectId, message: 'Project unhidden successfully' };
  }
}