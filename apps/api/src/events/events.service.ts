import {
  BadRequestException,
  ForbiddenException,
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
import { UserRole } from '@repo/types';
import { AccessDeniedException } from '../common/security/access-denied.exception';
import { AccessDeniedReason } from '../common/security/access-denied-reason.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectConnection() private readonly connection: Connection,
    private readonly filesService: FilesService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  private toId(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof (value as { toString?: () => string }).toString === 'function') {
      return (value as { toString: () => string }).toString();
    }

    return null;
  }

  private ensureCanManageEvent(
    event: Event,
    actorId: string,
    actorRole: UserRole,
    reason: AccessDeniedReason,
    message: string,
  ) {
    const createdById = this.toId(event.createdBy);

    if (!createdById) {
      throw new AccessDeniedException({
        reason: AccessDeniedReason.EVENT_OWNER_MISSING,
        message: 'Event owner is not defined.',
        resourceType: 'event',
        resourceId: event._id?.toString(),
        actorId,
        actorRole,
      });
    }

    if (actorRole === UserRole.ADMIN || createdById === actorId) {
      return;
    }

    throw new AccessDeniedException({
      reason,
      message,
      resourceType: 'event',
      resourceId: event._id?.toString(),
      actorId,
      actorRole,
    });
  }

  private ensureCanViewEvent(event: Event, actorId: string, actorRole: UserRole) {
    const createdById = this.toId(event.createdBy);
    const isParticipant = event.participants?.some((participant) => {
      const participantId = this.toId((participant as { _id?: unknown })._id ?? participant);
      return participantId === actorId;
    });

    if (
      actorRole === UserRole.ADMIN ||
      !event.isPrivate ||
      createdById === actorId ||
      isParticipant
    ) {
      return;
    }

    throw new AccessDeniedException({
      reason: AccessDeniedReason.EVENT_VIEW_PRIVATE_FORBIDDEN,
      message: 'You are not allowed to view this private event.',
      resourceType: 'event',
      resourceId: event._id?.toString(),
      actorId,
      actorRole,
    });
  }

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

  async findAll(actorId: string, actorRole: UserRole) {
    const filter =
      actorRole === UserRole.ADMIN
        ? {}
        : {
            $or: [
              { isPrivate: false },
              { createdBy: actorId },
              { participants: actorId },
            ],
          };

    return this.eventModel
      .find(filter)
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

  async findOne(id: string, actorId: string, actorRole: UserRole) {
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

    this.ensureCanViewEvent(event, actorId, actorRole);

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

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    usedId: string,
    actorRole: UserRole,
  ) {
    try {
      const existingEvent = await this.eventModel.findById(id).select('createdBy');

      if (!existingEvent) {
        throw new NotFoundException(`Event with ID: ${id} not found`);
      }

      this.ensureCanManageEvent(
        existingEvent,
        usedId,
        actorRole,
        AccessDeniedReason.EVENT_UPDATE_NOT_OWNER,
        'You are not allowed to update this event.',
      );

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

  async remove(
    eventId: string,
    actorId: string,
    actorRole: UserRole,
  ): Promise<{ id: string; message: string }> {
    const event = await this.eventModel.findById(eventId);

    if (!event) {
      throw new NotFoundException(`Event with ID: ${eventId} not found`);
    }

    const createdById = this.toId(event.createdBy);

    if (!createdById) {
      throw new AccessDeniedException({
        reason: AccessDeniedReason.EVENT_OWNER_MISSING,
        message: 'Event owner is not defined.',
        resourceType: 'event',
        resourceId: eventId,
        actorId,
        actorRole,
      });
    }

    if (actorRole !== UserRole.ADMIN && createdById !== actorId) {
      throw new AccessDeniedException({
        reason: AccessDeniedReason.EVENT_DELETE_NOT_OWNER,
        message: 'You are not allowed to delete this event.',
        resourceType: 'event',
        resourceId: eventId,
        actorId,
        actorRole,
      });
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      await this.activitiesService.deleteManyByEntity(eventId, session);

      await this.eventModel.findByIdAndDelete(eventId, { session });

      const files = await this.filesService.findFilesForEntity(eventId);

      await this.filesService.deleteFilesForResource(files);

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
    actorRole: UserRole,
  ): Promise<{ productsAdded: string[]; message: string }> {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID: ${eventId} not found`);
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new BadRequestException('productIds must be a non-empty array');
    }

    this.ensureCanManageEvent(
      event,
      userId,
      actorRole,
      AccessDeniedReason.EVENT_MANAGE_NOT_OWNER,
      'You are not allowed to manage products for this event.',
    );

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
    actorRole: UserRole,
  ): Promise<{ removedProduct: string; message: string }> {
    const event = await this.eventModel.findById(eventId).select('createdBy');

    if (!event) {
      throw new NotFoundException(`Event with ID: ${eventId} not found`);
    }

    this.ensureCanManageEvent(
      event,
      userId,
      actorRole,
      AccessDeniedReason.EVENT_MANAGE_NOT_OWNER,
      'You are not allowed to manage products for this event.',
    );

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
    actorRole: UserRole,
  ): Promise<{ participantsAdded: string[]; message: string }> {
    const event = await this.eventModel.findById(eventId).exec();
    if (!event)
      throw new NotFoundException(`Event with ID: ${eventId} not found`);

    if (!Array.isArray(userIds) || userIds.length === 0)
      throw new BadRequestException('userIds must be a non-empty array');

    this.ensureCanManageEvent(
      event,
      updater,
      actorRole,
      AccessDeniedReason.EVENT_MANAGE_NOT_OWNER,
      'You are not allowed to manage participants for this event.',
    );

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
    actorRole: UserRole,
  ): Promise<{ removedParticipant: string; message: string }> {
    const event = await this.eventModel.findById(eventId).select('createdBy');

    if (!event) {
      throw new NotFoundException(`Event with ID: ${eventId} not found`);
    }

    this.ensureCanManageEvent(
      event,
      updater,
      actorRole,
      AccessDeniedReason.EVENT_MANAGE_NOT_OWNER,
      'You are not allowed to manage participants for this event.',
    );

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
