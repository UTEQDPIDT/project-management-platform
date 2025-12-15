import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createActivityDto: CreateActivityDto, userId: string, files?: Express.Multer.File[]): Promise<Activity> {
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

  async findManyByIds(ids: string[]): Promise<string[]> {
  const activities = await this.activityModel.find({
    _id: { $in: ids },
  }).select('_id');

  if (activities.length !== ids.length) {
    throw new NotFoundException('One or more activities were not found');
  }

  return activities.map(a => a._id.toString());
}


  async update(id: string, updateActivityDto: UpdateActivityDto, userId: string, newFiles?: Express.Multer.File[]): Promise<Activity> {

    const activity = await this.activityModel.findById(id);

    if (!activity) {
      throw new NotFoundException(`Activity with ID: ${id} not found`);
    }

    let updatedFiles: string[] = [...(activity.files ?? [])];

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

  async removeFile(activityId: string, fileId: string, userId: string) {

    const activity = await this.activityModel.findById(activityId);
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${activityId} not found`);
    }

    if (!activity.files.includes(fileId)) {
      throw new BadRequestException('File does not belong to this activity');
    }

    await this.filesService.deleteFile(fileId);

    const updated = await this.activityModel.findByIdAndUpdate(
      activityId,
      {
        $pull: { files: fileId },
        updatedBy: userId,
      },
      { new: true },
    );

    return updated;
  }

  async remove(id: string) {
    const activity = await this.activityModel.findById(id);

    if (!activity) {
      throw new NotFoundException(`Activity with ID: ${id} not found`);
    }

    if(activity.files && activity.files.length > 0){
      for (const fileId of activity.files){
        await this.filesService.deleteFile(fileId.toString());
      }
    }

    const deletedActivity = await this.activityModel.findByIdAndDelete(id);

    return deletedActivity;
  }
}
