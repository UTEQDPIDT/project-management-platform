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
import { ActivitiesService } from '../activities/activities.service';
import { Product } from '../schemas/product.schema';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectConnection() private readonly connection: Connection,
    private readonly filesService: FilesService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    userId: string,
  ): Promise<{ id: string; message: string }> {
    try {
      const createdEvent = await this.eventModel.create({
        ...createEventDto,
        createdBy: userId,
        updatedBy: userId,
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
      .populate({
        path: 'products',
        populate: [
          { path: 'owner' },
          { path: 'category' },
          { path: 'subcategory' },
        ],
      })
      .exec();
  }

  async findOne(id: string) {
    const event = await this.eventModel
      .findById(id)
      .populate('participants')
      .populate('createdBy')
      .populate('updatedBy')
      .populate('products')
      .populate({
        path: 'products',
        populate: [
          { path: 'owner' },
          { path: 'category' },
          { path: 'subcategory' },
        ],
      });

    if (!event) {
      throw new NotFoundException(`Event with ID: ${id} not found`);
    }

    return event;
  }

  /**
   * Fetch all events where a user is owner or participant
   */
  async findByUser(userId: string) {
    return this.eventModel
      .find({
        $or: [{ createdBy: userId }, { participants: userId }],
      })
      .populate('participants')
      .exec();
  }

  async update(id: string, updateEventDto: UpdateEventDto, usedId: string) {
    try {
      const {
        name,
        summary,
        startDate,
        endDate,
        organization,
        location,
        type,
        isPrivate,
        acceptsProducts,
        participants,
        attendance,
      } = updateEventDto;

      const updatePayload = {
        ...(name !== undefined && { name }),
        ...(summary !== undefined && { summary }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(organization !== undefined && { organization }),
        ...(location !== undefined && { location }),
        ...(type !== undefined && { type }),
        ...(isPrivate !== undefined && { isPrivate }),
        ...(acceptsProducts !== undefined && { acceptsProducts }),
        ...(participants !== undefined && { participants }),
        ...(attendance !== undefined && { attendance }),
        updatedBy: usedId,
      };

      const updatedEvent = await this.eventModel.findByIdAndUpdate(
        id,
        {
          $set: updatePayload,
        },
        { new: true, runValidators: true },
      );
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

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      await this.activitiesService.deleteManyByEntity(eventId, session);

      await this.eventModel.findByIdAndDelete(eventId, { session });

      const files = await this.filesService.findFilesForEntity(eventId);

      await this.filesService.deleteFiles(files);

      await session.commitTransaction();

      return { id: eventId, message: 'Event deleted successfully' };
    } catch (err: any) {
      await session.abortTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await session.endSession();
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
