import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Event } from '../schemas/event.schema';
import { FilesService } from '../files/files.service';
import { ProductsService } from '../products/products.service';
import { ActivitiesService } from '../activities/activities.service';
import { CreateActivityDto } from '../activities/dto/create-activity.dto';
import { Product } from '../schemas/product.schema';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectConnection() private readonly connection: Connection,
    private readonly filesService: FilesService,
    private readonly activitiesService: ActivitiesService,
    private readonly productsService: ProductsService,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    userId: string,
    report?: Express.Multer.File,
  ): Promise<{ id: string; message: string }> {
    try {
      let uploadedFileId: string | null = null;

      if (report) {
        const savedFile = await this.filesService.uploadToGridFS(
          report,
          userId,
        );
        uploadedFileId = savedFile.id.toString();
      }

      const createdEvent = await this.eventModel.create({
        ...createEventDto,
        createdBy: userId,
        updatedBy: userId,
        report: uploadedFileId,
      });

      return {
        id: createdEvent._id.toString(),
        message: `Event created successfully`,
      };
    } catch (err: any) {
      throw new BadRequestException('Error al crear el evento: ' + err.message);
    }
  }

  async findAll() {
    return this.eventModel
      .find()
      .populate('participants')
      .populate('createdBy')
      .populate('updatedBy')
      .populate('activities')
      .populate('products')
      .exec();
  }

  async findOne(id: string) {
    const event = await this.eventModel
      .findById(id)
      .populate('participants')
      .populate('createdBy')
      .populate('updatedBy')
      .populate('activities')
      .populate('products');
    if (!event) {
      throw new NotFoundException(`Event with ID: ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, usedId: string) {
    try {
      const updatedEvent = this.eventModel.findByIdAndUpdate(id, {
        ...updateEventDto,
        updatedBy: usedId,
      });
      if (!updatedEvent) {
        throw new NotFoundException(`Event with ID: ${id} not found`);
      }
      return updatedEvent;
    } catch (err: any) {
      throw new BadRequestException('Error updating event' + err.message);
    }
  }

  async remove(eventId: string): Promise<{ id: string; message: string }> {
    const event = await this.eventModel.findById(eventId);

    if (!event) {
      throw new NotFoundException(`Event with ID: ${eventId} not found`);
    }

    if (event.report) {
      throw new BadRequestException(
        'This event already has a report file. Please delete it before uploading a new one.',
      );
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const reportFile = event.report;
      if (reportFile) await this.filesService.deleteFile(reportFile.toString());

      await this.activitiesService.deleteManyByEvent(eventId, session);

      await this.eventModel.findByIdAndDelete(eventId, { session });

      await session.commitTransaction();

      return { id: eventId, message: 'Event deleted successfully' };
    } catch (err: any) {
      await session.abortTransaction();
      throw new BadRequestException(err.message);
    } finally {
      session.endSession();
    }
  }

  /**
   * FILES
   */
  async uploadReportFile(
    eventId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ report: string; message: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    if (event.report) {
      throw new BadRequestException(
        'This event already has a report file. Please delete it before uploading a new one.',
      );
    }

    const savedFile = await this.filesService.uploadToGridFS(file, userId);

    const updatedEvent = await this.eventModel.findByIdAndUpdate(eventId, {
      report: savedFile.id,
      updatedBy: userId,
    });

    return {
      report: updatedEvent.report.toString(),
      message: `Report file uploaded successfully to event with id ${eventId}`,
    };
  }

  async removeReportFile(
    eventId: string,
    updater: string,
  ): Promise<{ report: null; message: string }> {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    if (!event.report) {
      throw new BadRequestException('This event has no report file assigned');
    }

    await this.filesService.deleteFile(event.report.toString());

    await this.eventModel.findByIdAndUpdate(eventId, {
      report: null,
      updatedBy: updater,
    });

    return {
      report: null,
      message: `Report file removed successfully from event with id ${eventId}`,
    };
  }

  /**
   * ACTIVITIES
   */
  async createActivity(
    eventId: string,
    dto: CreateActivityDto,
    userId: string,
  ) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const activity = await this.activitiesService.create(dto, userId, {
        session,
        eventId,
      });

      await this.eventModel.updateOne(
        { _id: eventId },
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

  async deleteActivity(eventId: string, activityId: string, userId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      await this.activitiesService.remove(activityId);
      await this.eventModel.updateOne(
        { _id: eventId },
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

  /**
   * PRODUCTS
   */
  async addProducts(
    eventId: string,
    productIds: string[],
    userId: string,
  ): Promise<{ productsAdded: string[]; message: string }> {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID: ${eventId} not found`);
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new BadRequestException('productIds must be a non-empty array');
    }

    const registeredProducts = new Set(
      event.products.map((p: Product) => p._id.toString()),
    );

    const newProducts = productIds.filter((p) => !registeredProducts.has(p));

    try {
      await this.eventModel.findByIdAndUpdate(eventId, {
        $addToSet: { products: { $each: newProducts } },
        updatedBy: userId,
      });

      return {
        productsAdded: productIds,
        message: `Products added successfully to event with id ${eventId}`,
      };
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async removeProduct(
    eventId: string,
    productId: string,
    userId: string,
  ): Promise<{ removedProduct: string; message: string }> {
    await this.eventModel.findByIdAndUpdate(eventId, {
      $pull: { products: productId },
      updatedBy: userId,
    });

    return {
      removedProduct: productId,
      message: `Product removed successfully from event with id ${eventId}`,
    };
  }

  /**
   * PARTICIPANTS
   */
  async addParticipants(
    eventId: string,
    userIds: string[],
    updater: string,
  ): Promise<{ participantsAdded: string[]; message: string }> {
    const event = await this.eventModel.findById(eventId).exec();
    if (!event)
      throw new NotFoundException(`Event with ID: ${eventId} not found`);

    if (!Array.isArray(userIds) || userIds.length === 0)
      throw new BadRequestException('userIds must be a non-empty array');

    const existingIds = event.participants.map((p: any) =>
      p._id ? p._id.toString() : p.toString(),
    );

    const newIds = userIds.filter((id) => !existingIds.includes(id));

    if (newIds.length === 0)
      throw new BadRequestException('All users are already participants');

    await this.eventModel.findByIdAndUpdate(eventId, {
      $addToSet: { participants: { $each: newIds } },
      updatedBy: updater,
    });

    return {
      participantsAdded: newIds,
      message: `Participants added successfully to event with id ${eventId}`,
    };
  }

  async removeParticipant(
    eventId: string,
    userId: string,
    updater: string,
  ): Promise<{ removedParticipant: string; message: string }> {
    await this.eventModel.findByIdAndUpdate(eventId, {
      $pull: { participants: userId },
      updatedBy: updater,
    });

    return {
      removedParticipant: userId,
      message: `Participants removed successfully from event with id ${eventId}`,
    };
  }

  async addParticipant(eventId: string, userId: string) {
    try {
      await this.eventModel.findByIdAndUpdate(eventId, {
        $push: { participants: userId },
      });

      return {
        addedParticipantId: userId,
        message: `Participant with ID ${userId} added successfully`,
      };
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }
}
