import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from '../schemas/project.schema';
import { Model } from 'mongoose';
import { FilesService } from '../files/files.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private readonly filesService: FilesService,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<Project> {
    try {
      const newProject = await this.projectModel.create({
        ...createProjectDto,
        owner: userId,
      });
      return newProject;
    } catch (err: any) {
      throw new BadRequestException('Error al crear el proyecto' + err.message);
    }
  }

  async findAll() {
    return await this.projectModel.find().exec();
  }

  async findOne(id: string) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Proyecto con el ID ${id} no encontrado.`);
    }
    return project;
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

    return updatedProject;
  }

  async remove(id: string) {
    const project = await this.projectModel.findById(id);

    if (!project) {
      throw new NotFoundException(`Project with ID: ${id} not found`);
    }

    if (project.files && project.files.length > 0) {
      for (const fileId of project.files) {
        await this.filesService.deleteFile(fileId.toString());
      }
    }

    const deletedProject = await this.projectModel.findByIdAndDelete(id);

    return deletedProject;
  }
}
