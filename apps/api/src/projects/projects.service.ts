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

  async create(createProjectDto: CreateProjectDto, userId: string, files?: Express.Multer.File[]): Promise<{ id: string, message: string }> {
    try {

      let uploadedFiles: string[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const savedFile = await this.filesService.uploadToGridFS(file, userId);
          uploadedFiles.push(savedFile.id);
        }
      }

      const newProject = await this.projectModel.create({
        ...createProjectDto,
        owner: userId,
        files: uploadedFiles,
      });
      return {
        id: newProject._id.toString(),
        message: 'Proyecto creado exitosamente',
      };
    } catch (err: any) {
      throw new BadRequestException('Error al crear el proyecto' + err.message);
    }
  }

  async findAll(): Promise<Project[]> {
    return await this.projectModel.find().exec();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Proyecto con el ID ${id} no encontrado.`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string, newFiles?: Express.Multer.File[]): Promise<{ id: string, message: string }> {

    const project = await this.projectModel.findById(id);

    if (!project) {
      throw new NotFoundException(`Project with ID: ${id} not found`);
    }

    let updatedFiles: string[] = [...(project.files ?? [])];

    // Obtener metadata de los archivos existentes
    const existingFilesMetadata = await Promise.all(
      updatedFiles.map(fileId => this.filesService.getFileMetadata(fileId)),
    );

    // Validar duplicados por nombre
    if (newFiles && newFiles.length > 0) {

      for (const file of newFiles) {
        const duplicate = existingFilesMetadata.find(
          meta => meta.name === file.originalname,
        );

        if (duplicate) {
          throw new BadRequestException(
            `Ya existe un archivo con el nombre "${file.originalname}" en esta actividad.`,
          );
        }
      }

      // Agregar archivos nuevos si pasaron la validación
      for (const file of newFiles) {
        const savedFile = await this.filesService.uploadToGridFS(file, userId);
        updatedFiles.push(savedFile.id.toString());
      }
    }

    await this.projectModel.findByIdAndUpdate(
      id,
      {
        ...updateProjectDto,
        updatedBy: userId,
        files: updatedFiles,
      },
      { new: true },
    );

    return { id, message: 'Project updated successfully' };
  }

  async removeFile(projectId: string, fileId: string, userId: string): Promise<{ id: string, message: string }> {

    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (!project.files.includes(fileId)) {
      throw new BadRequestException('File does not belong to this activity');
    }

    await this.filesService.deleteFile(fileId);

    await this.projectModel.findByIdAndUpdate(
      projectId,
      {
        $pull: { files: fileId },
        updatedBy: userId,
      },
      { new: true },
    );

    return { id: projectId, message: 'File removed successfully' };
  }

  async remove(id: string): Promise<{ id: string, message: string }> {
    const project = await this.projectModel.findById(id);
  
    if (!project) {
      throw new NotFoundException(`Project with ID: ${id} not found`);
    }
  
    if(project.files && project.files.length > 0){
      for (const fileId of project.files){
        await this.filesService.deleteFile(fileId.toString());
      }
    }
  
    await this.projectModel.findByIdAndDelete(id);
  
    return { id, message: 'Project deleted successfully' };
  }
}
