import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../schemas/events.schema';
import { FilesService } from '../files/files.service';

@Injectable()
export class EventsService {

  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private readonly filesService: FilesService,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string, report?: Express.Multer.File): Promise<Event> {
    try {

      let uploadedFileId: string | null = null;

      if (report) {
        const savedFile = await this.filesService.uploadToGridFS(report, userId);
        uploadedFileId = savedFile.id.toString();
      } 

      const createdEvent = await this.eventModel.create({
        ...createEventDto,
        createdBy: userId,
        report: uploadedFileId
      });

      return createdEvent;

    } catch (err: any) {
      throw new BadRequestException('Error al crear el evento: ' + err.message);
    }
  }

  async addParticipants(eventId: string, userIds: string[], updater: string): Promise<Event> {
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) throw new NotFoundException(`Event with ID: ${eventId} not found`);
  
    if (!Array.isArray(userIds) || userIds.length === 0)
      throw new BadRequestException("userIds must be a non-empty array");
  
    const existingIds = event.participants.map((p: any) =>
      p._id ? p._id.toString() : p.toString()
    );
  
    const newIds = userIds.filter(id => !existingIds.includes(id));
  
    if (newIds.length === 0)
      throw new BadRequestException("All users are already participants");
  
    return await this.eventModel.findByIdAndUpdate(
      eventId,
      { 
        $addToSet: { participants: { $each: newIds } },
        updatedBy: updater,
      },
      { new: true }
    );
  }

  async uploadReportFile(eventId: string, file: Express.Multer.File, userId: string): Promise<{ report: string, message: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    if (event.report) {
      throw new BadRequestException('This event already has a report file. Please delete it before uploading a new one.');
    }

    const savedFile = await this.filesService.uploadToGridFS(file, userId);

    const updatedEvent = await this.eventModel.findByIdAndUpdate(
      eventId,
      { 
        report: savedFile.id,
        updatedBy: userId,
      },
      { new: true },
    );

    return { report: updatedEvent.report, message: 'Report file uploaded successfully' };
  }

  async addActivities(eventId: string, activityIds: string[], updater: string): Promise<Event> {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException(`Event with ID: ${eventId} not found`);

    if (!Array.isArray(activityIds) || activityIds.length === 0)
      throw new BadRequestException('activityIds must be a non-empty array');

    return this.eventModel.findByIdAndUpdate(
      eventId,
      { 
        $addToSet: { activities: { $each: activityIds } },
        updatedBy: updater,
      },
      { new: true }
    );
  }

  async addProducts(eventId: string, productIds: string[], updater: string): Promise<Event> {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException(`Event with ID: ${eventId} not found`);

    if (!Array.isArray(productIds) || productIds.length === 0)
      throw new BadRequestException('productIds must be a non-empty array');

    return this.eventModel.findByIdAndUpdate(
      eventId,
      { 
        $addToSet: { products: { $each: productIds } },
        updatedBy: updater,
      },
      { new: true }
    );
  }

  async findAll() {
    return this.eventModel.find().exec();
  }

  async findOne(id: string) {
    const event = this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with ID: ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, updater: string) {
    try {
      const updatedEvent = this.eventModel.findByIdAndUpdate(id, {
        ...updateEventDto,
        updatedBy: updater,
      });
      if (!updatedEvent) {
        throw new NotFoundException(`Event with ID: ${id} not found`);
      }
      return updatedEvent;
    } catch (err: any) {
      throw new BadRequestException('Error updating event' + err.message);
    }
  }

  async remove(id: string) {

    const event = await this.eventModel.findById(id);

    if (!event) {
      throw new NotFoundException(`Event with ID: ${id} not found`);
    }

    const reportFile = event.report;

    if (reportFile)
      await this.filesService.deleteFile(reportFile.toString());

    const deletedEvent = await this.eventModel.findByIdAndDelete(id);
    return deletedEvent;
  }

  async removeParticipant(eventId: string, userId: string, updater: string): Promise<Event> {
    return this.eventModel.findByIdAndUpdate(
      eventId,
      { 
        $pull: { participants: userId },
        updatedBy: updater,
      },
      { new: true }
    );
  }

  async removeReportFile(eventId: string, updater: string): Promise<Event> {

  const event = await this.eventModel.findById(eventId);
  if (!event) {
    throw new NotFoundException(`Event with ID ${eventId} not found`);
  }

  if (!event.report) {
    throw new BadRequestException('This event has no report file assigned');
  }

  await this.filesService.deleteFile(event.report.toString());

  const updatedEvent = await this.eventModel.findByIdAndUpdate(
    eventId,
    { 
      report: null,
      updatedBy: updater,
    },
    { new: true }
  );

  return updatedEvent;
}


  async removeActivity(eventId: string, activityId: string, updater: string): Promise<Event> {
    return this.eventModel.findByIdAndUpdate(
      eventId,
      { 
        $pull: { activities: activityId },
        updatedBy: updater,
      },
      { new: true }
    );
  }

  async removeProduct(eventId: string, productId: string, updater: string): Promise<Event> {
    return this.eventModel.findByIdAndUpdate(
      eventId,
      { 
        $pull: { products: productId },
        updatedBy: updater,
      },
      { new: true }
    );
  }

}
