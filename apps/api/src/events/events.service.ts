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

  async create(createEventDto: CreateEventDto, userId: string) {
    try {
      const createdEvent = await this.eventModel.create({
        ...createEventDto,
        createdBy: userId,
      });
      return createdEvent;
    } catch (err: any) {
      throw new BadRequestException('Error al crear el evento: ' + err.message);
    }
  }

  async addParticipants(eventId: string, userIds: string[]): Promise<Event> {
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
      { $addToSet: { participants: { $each: newIds } } },
      { new: true }
    );
  }

  async uploadReportFile(eventId: string, file: Express.Multer.File, userId: string): Promise<Event> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const savedFile = await this.filesService.uploadToGridFS(file, userId);

    const updatedEvent = await this.eventModel.findByIdAndUpdate(
      eventId,
      { report: savedFile.id },
      { new: true },
    );

    return updatedEvent;
  }

  async addActivities(eventId: string, activityIds: string[]): Promise<Event> {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException(`Event with ID: ${eventId} not found`);

    if (!Array.isArray(activityIds) || activityIds.length === 0)
      throw new BadRequestException('activityIds must be a non-empty array');

    return this.eventModel.findByIdAndUpdate(
      eventId,
      { $addToSet: { activities: { $each: activityIds } } },
      { new: true }
    );
  }

  async addProducts(eventId: string, productIds: string[]): Promise<Event> {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException(`Event with ID: ${eventId} not found`);

    if (!Array.isArray(productIds) || productIds.length === 0)
      throw new BadRequestException('productIds must be a non-empty array');

    return this.eventModel.findByIdAndUpdate(
      eventId,
      { $addToSet: { products: { $each: productIds } } },
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

  async update(id: string, updateEventDto: UpdateEventDto, userId: string) {
    try {
      const updatedEvent = this.eventModel.findByIdAndUpdate(id, {
        ...updateEventDto,
        updatedBy: userId,
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
    const deletedEvent = this.eventModel.findByIdAndDelete(id);
    if (!deletedEvent) {
      throw new NotFoundException(`Event with ID: ${id} not found`);
    }
    return deletedEvent;
  }

  async removeParticipant(eventId: string, userId: string): Promise<Event> {
    return this.eventModel.findByIdAndUpdate(
      eventId,
      { $pull: { participants: userId } },
      { new: true }
    );
  }

  async removeReportFile(eventId: string): Promise<Event> {
  // 1. Buscar evento
  const event = await this.eventModel.findById(eventId);
  if (!event) {
    throw new NotFoundException(`Event with ID ${eventId} not found`);
  }

  // 2. Validar que el evento tenga un archivo asignado
  const isFile = event.report;
  if (!isFile) {
    throw new BadRequestException('This event has no report file assigned');
  }

  // 3. Eliminar archivo de GridFS + colección File
  await this.filesService.deleteFile(isFile.toString());

  // 4. Eliminar referencia en el evento
  const updatedEvent = await this.eventModel.findByIdAndUpdate(
    eventId,
    { $unset: { report: '' } }, // elimina el campo
    { new: true }
  );

  return updatedEvent;
}


  async removeActivity(eventId: string, activityId: string): Promise<Event> {
    return this.eventModel.findByIdAndUpdate(
      eventId,
      { $pull: { activities: activityId } },
      { new: true }
    );
  }

  async removeProduct(eventId: string, productId: string): Promise<Event> {
    return this.eventModel.findByIdAndUpdate(
      eventId,
      { $pull: { products: productId } },
      { new: true }
    );
  }

}
