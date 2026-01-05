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
import { CreateProductDto } from '../products/dto/create-product.dto';
import { ActivitiesService } from '../activities/activities.service';
import { CreateActivityDto } from '../activities/dto/create-activity.dto';

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
            activities: [],
            owner: userId,
            updatedBy: userId,
          },
        ],
        { session },
      );

      const projectId = project._id;

      let createdActivities = [];
      if (activities && activities.length) {
        createdActivities = await this.activitiesService.createOnBulk(
          activities,
          userId,
          session,
          projectId.toString(),
        );
      }

      await this.projectModel.updateOne(
        { _id: projectId },
        { $set: { activities: createdActivities.map((a) => a._id) } },
        { session },
      );

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
        populate: [
          { path: 'owner' },
          { path: 'members' },
          { path: 'collaborators' },
        ],
      })
      .populate({ path: 'relatedProjects', populate: [{ path: 'activities' }] })
      .populate({
        path: 'activities',
        populate: [{ path: 'assignees' }, { path: 'files' }],
      })
      .populate({
        path: 'products',
        populate: [
          { path: 'category' },
          { path: 'subcategory' },
          { path: 'owner' },
        ],
      })
      .populate('files')
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
        populate: [
          { path: 'owner' },
          { path: 'members' },
          { path: 'collaborators' },
        ],
      })
      .populate({ path: 'relatedProjects', populate: [{ path: 'activities' }] })
      .populate({
        path: 'activities',
        populate: [{ path: 'assignees' }, { path: 'files' }],
      })
      .populate({
        path: 'products',
        populate: [
          { path: 'category' },
          { path: 'subcategory' },
          { path: 'owner' },
        ],
      })
      .populate('files')
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
        populate: [
          { path: 'owner' },
          { path: 'members' },
          { path: 'collaborators' },
        ],
      })
      .populate({ path: 'relatedProjects', populate: [{ path: 'activities' }] })
      .populate({
        path: 'activities',
        populate: [{ path: 'assignees' }, { path: 'files' }],
      })
      .populate({
        path: 'products',
        populate: [
          { path: 'category' },
          { path: 'subcategory' },
          { path: 'owner' },
        ],
      })
      .populate('files')
      .populate('owner')
      .populate('updatedBy');
  }

  async findByTeam(teamId: string) {
    return await this.projectModel
      .find({ team: teamId })
      .populate('activities');
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
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

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Delete files
      //   if (project.files && project.files.length > 0) {
      //     for (const fileId of project.files) {
      //       await this.filesService.deleteFile(fileId.toString());
      //     }
      //   }

      // Delete products
      await this.productService.deleteMany(projectId, session);

      // Delete activities
      await this.activitiesService.deleteManyByProject(projectId, session);

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

  /**
   * Product Services
   */
  async createProduct(
    projectId: string,
    dto: CreateProductDto,
    userId: string,
  ) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const product = await this.productService.create(
        dto,
        userId,
        projectId,
        session,
      );

      await this.projectModel.updateOne(
        { _id: projectId },
        { $push: { products: product._id }, $set: { updatedBy: userId } },
        { session },
      );

      await session.commitTransaction();
      return product;
    } catch (err: any) {
      await session.abortTransaction();
      throw new BadRequestException(err.message);
    } finally {
      session.endSession();
    }
  }

  async deleteProduct(projectId: string, productId: string, userId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      await this.productService.remove(productId);
      await this.projectModel.updateOne(
        { _id: projectId },
        { $pull: { products: productId }, $set: { updatedBy: userId } },
        { session },
      );

      await session.commitTransaction();
      return { message: 'Producto eliminado del proyecto correctamente.' };
    } catch (err: any) {
      await session.abortTransaction();
      throw new BadRequestException(err.message);
    } finally {
      session.endSession();
    }
  }

  /**
   * Activities Services
   */
  async createActivity(
    projectId: string,
    dto: CreateActivityDto,
    userId: string,
  ) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const activity = await this.activitiesService.create(
        dto,
        userId,
        session,
        projectId,
      );

      await this.projectModel.updateOne(
        { _id: projectId },
        { $push: { activities: activity._id }, $set: { updatedBy: userId } },
        { session },
      );

      await session.commitTransaction();
      return activity;
    } catch (err: any) {
      await session.abortTransaction();
      throw new BadRequestException(err.message);
    } finally {
      session.endSession();
    }
  }

  async deleteActivity(projectId: string, activityId: string, userId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      await this.activitiesService.remove(activityId);
      await this.projectModel.updateOne(
        { _id: projectId },
        { $pull: { activities: activityId }, $set: { updatedBy: userId } },
        { session },
      );

      await session.commitTransaction();
      return { message: 'Actividad eliminada del proyecto correctamente.' };
    } catch (err: any) {
      await session.abortTransaction();
      throw new BadRequestException(err.message);
    } finally {
      session.endSession();
    }
  }
}
