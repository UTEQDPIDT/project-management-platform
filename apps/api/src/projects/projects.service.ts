import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Project } from '../schemas/project.schema';
import { Connection, Model } from 'mongoose';
import { FilesService } from '../files/files.service';
import { ProductsService } from '../products/products.service';
import { ActivitiesService } from '../activities/activities.service';
import { EntityType, ProjectStatus, Status } from '@repo/types';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private readonly productService: ProductsService,
    @Inject(forwardRef(() => ActivitiesService))
    private readonly activitiesService: ActivitiesService,
    private readonly filesService: FilesService,
  ) {}


  private validateActivities(activities?: { name: string }[]) {
    if (!activities || activities.length < 3) {
      throw new BadRequestException('El proyecto debe tener al menos 3 actividades.');
    }

    if (activities.some((activity) => !activity.name || !activity.name.trim())) {
      throw new BadRequestException('Cada actividad debe tener un nombre válido.');
    }
  }

  private getInitialProjectStatus(): ProjectStatus {
    return ProjectStatus.PENDING;
  }

  private getProjectStatusFromActivities(
    activities: Array<{ status: Status }>,
  ): ProjectStatus {
    if (activities.length < 3) {
      throw new BadRequestException(
        'El proyecto debe tener al menos 3 actividades.',
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

  async recomputeProjectStatus(projectId: string): Promise<ProjectStatus> {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException(`Project with ID: ${projectId} not found`);
    }

    const activities = await this.activitiesService.findByEntityId(projectId);
    const status = this.getProjectStatusFromActivities(activities);

    await this.projectModel.findByIdAndUpdate(projectId, { status });

    return status;
  }

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
      .exec();
  }

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
      .populate('updatedBy');
    if (!project) {
      throw new NotFoundException(`Proyecto con el ID ${id} no encontrado.`);
    }

    return project;
  }

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
      .populate('updatedBy');
  }

  async findByTeam(teamId: string) {
    return await this.projectModel.find({ team: teamId });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.projectModel.findById(id);

    if (!project) {
      throw new NotFoundException(`Project with ID: ${id} not found`);
    }

    await this.projectModel.findByIdAndUpdate(id, {
      ...updateProjectDto,
      updatedBy: userId,
    });

    return { id, message: 'Project updated successfully' };
  }

  async remove(projectId: string) {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException(`Project with ID: ${projectId} not found`);
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
}
