import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Activity } from '../schemas/activities.schema';
import { Model } from 'mongoose';
import { FilesService } from '../files/files.service';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    private readonly filesService: FilesService,
  ) {}

  async create(
    createActivityDto: CreateActivityDto,
    userId: string,
    files?: Express.Multer.File[],
  ): Promise<Activity> {
    try {
      let uploadedFiles: string[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const savedFile = await this.filesService.uploadToGridFS(file, userId);
          uploadedFiles.push(savedFile.id);
        }
      }

      const createdActivity = await this.activityModel.create({
        ...createActivityDto,
        createdBy: userId,
        files: uploadedFiles,
      });

      return createdActivity;
    } catch (err: any) {
      throw new BadRequestException('Error al crear la actividad: ' + err.message);
    }
  }


  async findAll() {
    return this.activityModel.find().exec();
  }

  async findOne(id: string) {
    const activity = this.activityModel.findById(id);
    if (!activity) {
      throw new NotFoundException(`Activity with ID: ${id} not found`);
    }
    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto, userId: string, newFiles?: Express.Multer.File[] ): Promise<Activity> {

    const activity = await this.activityModel.findById(id);

    if (!activity) {
      throw new NotFoundException(`Activity with ID: ${id} not found`);
    }

    let updatedFiles: string[] = [...(activity.files ?? [])];

    // Agregar archivos nuevos
    if (newFiles && newFiles.length > 0) {
      for (const file of newFiles) {
        const savedFile = await this.filesService.uploadToGridFS(file, userId);
        updatedFiles.push(savedFile.id.toString());
      }
    }

    // Eliminar archivos
    if (updateActivityDto.files) {
      const incomingIds = updateActivityDto.files;

      const filesToRemove = updatedFiles.filter(
        existingId => !incomingIds.includes(existingId.toString()),
      );

      for (const fileId of filesToRemove) {
        await this.filesService.deleteFile(fileId.toString());
      }

      updatedFiles = incomingIds;
    }

    const updatedActivity = await this.activityModel.findByIdAndUpdate(
      id,
      {
        ...updateActivityDto,
        updatedBy: userId,
        files: updatedFiles,
      },
      { new: true },
    );

    return updatedActivity;
  }

  async remove(id: string) {
    const deletedActivity = this.activityModel.findByIdAndDelete(id);

    if (!deletedActivity) {
      throw new NotFoundException(`Activity with ID: ${id} not found`);
    }

    return deletedActivity;
  }
}
