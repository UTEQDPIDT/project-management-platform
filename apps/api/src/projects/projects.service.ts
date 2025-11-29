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

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
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

  findAll() {
    return this.projectModel.find().exec();
  }

  findOne(id: string) {
    const project = this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Proyecto con el ID ${id} no encontrado.`);
    }
    return project;
  }

  update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    try {
      const updatedProject = this.projectModel.findByIdAndUpdate(
        id,
        {
          ...updateProjectDto,
          updatedBy: userId,
        },
        { new: true },
      );

      if (!updatedProject) {
        throw new BadRequestException('Error al editar el proyecto');
      }

      return updatedProject;
    } catch (err: any) {
      throw new NotFoundException(`Proyecto con el ID ${id} no encontrado.`);
    }
  }

  remove(id: string) {
    const project = this.projectModel.findByIdAndDelete(id);
    if (!project) {
      throw new NotFoundException(`Proyecto con el ID ${id} no encontrado.`);
    }
    return project;
  }
}
