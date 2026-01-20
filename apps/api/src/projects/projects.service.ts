import {
  BadRequestException,
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
import { EntityType } from '@repo/types';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private readonly productService: ProductsService,
    private readonly activitiesService: ActivitiesService,
    private readonly filesService: FilesService,
  ) {}

  async create(dto: CreateProjectDto, userId: string): Promise<Project> {
    const session = await this.connection.startSession();
    session.startTransaction();

    const { activities, ...projectData } = dto;

    try {
      const [project] = await this.projectModel.create(
        [
          {
            ...projectData,
            owner: userId,
            updatedBy: userId,
          },
        ],
        { session },
      );

      const projectId = project._id;

      if (activities && activities.length) {
        await this.activitiesService.createOnBulk(
          activities,
          userId,
          projectId.toString(),
          EntityType.PROJECT,
          session,
        );
      }

      await session.commitTransaction();

      return project;
    } catch (err: any) {
      await session.abortTransaction();
      throw new BadRequestException(err.message);
    } finally {
      session.endSession();
    }
  }

  async findAll() {
    return await this.projectModel
      .find()
      .populate('knowledgeAreas')
      .populate('prioritiesPND')
      .populate('sustainableObjectives')
      .populate('innovationLines')
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
      .populate('knowledgeAreas')
      .populate('prioritiesPND')
      .populate('sustainableObjectives')
      .populate('innovationLines')
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
      .populate('knowledgeAreas')
      .populate('prioritiesPND')
      .populate('sustainableObjectives')
      .populate('innovationLines')
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

    const updatedProject = await this.projectModel.findByIdAndUpdate(
      id,
      {
        ...updateProjectDto,
        updatedBy: userId,
      },
      { new: true },
    );

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
      session.endSession();
    }
  }
}
