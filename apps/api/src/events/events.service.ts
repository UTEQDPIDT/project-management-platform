import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Event } from '../schemas/event.schema';
import { User } from '../schemas/user.schema';
import { FilesService } from '../files/files.service';
import { ActivitiesService } from '../activities/activities.service';
import { Product } from '../schemas/product.schema';
import { ProjectValidation, UserRole } from '@repo/types';
import { AccessDeniedException } from '../common/security/access-denied.exception';
import { AccessDeniedReason } from '../common/security/access-denied-reason.enum';

@Injectable()
export class EventsService {
  private async ensureEventIsOpen(eventId: string) {
    const event = await this.eventModel.findById(eventId).select('validationStatus');
    if (!event) {
      throw new NotFoundException(`Event with ID: ${eventId} not found`);
    }
    if (
      (event.get?.('validationStatus') ?? event.validationStatus) ===
      ProjectValidation.FINAL_VALIDATION
    ) {
      throw new ForbiddenException('The event is closed. Reopen it before modifying it.');
    }
    return event;
  }
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(User.name) private userModel: Model<User>,
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
        validationStatus: ProjectValidation.UNDER_REVIEW,
      });

      return {
        id: createdEvent._id.toString(),
        message: `Event created successfully`,
      };
    } catch (err: any) {
      throw new BadRequestException('Error al crear el evento: ' + err.message);
    }
  }

  private async canCloseElementsPermission(userId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).select('canCloseElements');

    if (!user) {
      throw new NotFoundException(`User with ID: ${userId} not found`);
    }
    return Boolean(user.get('canCloseElements'));
  }

  private async canValidateProjectPermission(userId: string): Promise<boolean> {
      const user = await this.userModel.findById(userId).select('canValidateElements');
      if (!user) {
        throw new NotFoundException(`User with ID: ${userId} not found`);
      }
      return Boolean(user.get('canValidateElements'));
    }

    async applyFirstValidation(eventId: string, userId: string) {
      if (!(await this.canValidateProjectPermission(userId))) {
        throw new ForbiddenException('This user is not authorized to approve events.');
      }

      const event = await this.eventModel.findById(eventId);
      if (!event) throw new NotFoundException(`Event with ID: ${eventId} not found`);

      if (
        event.get('validationStatus') !== ProjectValidation.UNDER_REVIEW &&
        event.get('validationStatus') !== null &&
        event.get('validationStatus') !== undefined
      ) {
        throw new BadRequestException('The event has already been approved or closed.');
      }

      await this.eventModel.findByIdAndUpdate(eventId, {
        validationStatus: ProjectValidation.FIRST_VALIDATION,
        firstValidatedBy: new Types.ObjectId(userId),
        closedBy: null,
        updatedBy: userId,
      });

      return { id: eventId, message: 'Event approved successfully' };
    }

    async cancelFirstValidation(eventId: string, userId: string) {
      if (!(await this.canValidateProjectPermission(userId))) {
        throw new ForbiddenException('This user is not authorized to cancel event approval.');
      }

      const event = await this.eventModel.findById(eventId);
      if (!event) throw new NotFoundException(`Event with ID: ${eventId} not found`);
      if (event.get('validationStatus') !== ProjectValidation.FIRST_VALIDATION) {
        throw new BadRequestException('The event is not approved.');
      }

      await this.eventModel.findByIdAndUpdate(eventId, {
        validationStatus: ProjectValidation.UNDER_REVIEW,
        firstValidatedBy: null,
        closedBy: null,
        updatedBy: userId,
      });

      return { id: eventId, message: 'Event approval cancelled successfully' };
    }

    async closeEvent(eventId: string, userId: string) {
      if (!(await this.canCloseElementsPermission(userId))) {
        throw new ForbiddenException('This user is not authorized to close events.');
      }

      const event = await this.eventModel.findById(eventId);
      if (!event) throw new NotFoundException(`Event with ID: ${eventId} not found`);
      if (
        (event.get?.('validationStatus') ?? event.validationStatus) ===
        ProjectValidation.FINAL_VALIDATION
      ) {
        throw new BadRequestException('The event is already closed.');
      }
      if (event.get('validationStatus') !== ProjectValidation.FIRST_VALIDATION) {
        throw new BadRequestException('The event must be approved before it can be closed.');
      }

      await this.eventModel.findByIdAndUpdate(eventId, {
        validationStatus: ProjectValidation.FINAL_VALIDATION,
        closedBy: new Types.ObjectId(userId),
        updatedBy: userId,
      });

      return { id: eventId, message: 'Event closed successfully' };
    }

    async reopenEvent(eventId: string, userId: string) {
      if (!(await this.canCloseElementsPermission(userId))) {
        throw new ForbiddenException('This user is not authorized to reopen events.');
      }

      const event = await this.eventModel.findById(eventId);
      if (!event) throw new NotFoundException(`Event with ID: ${eventId} not found`);
      if (event.get('validationStatus') !== ProjectValidation.FINAL_VALIDATION) {
        throw new BadRequestException('The event is not closed.');
      }
      const closedByRaw = event.get('closedBy');
      const closedById =
        closedByRaw instanceof Types.ObjectId
          ? closedByRaw.toString()
          : closedByRaw?._id?.toString() || closedByRaw?.toString();
      // Legacy closed events predate closedBy and cannot be attributed retroactively.
      if (closedById && closedById !== userId) {
        throw new ForbiddenException(
          'Only the exact user account that closed this event is authorized to reopen it.',
        );
      }

      const firstValidatedByRaw = event.get('firstValidatedBy');
      const firstValidatedBy =
        firstValidatedByRaw?._id ?? firstValidatedByRaw ?? null;

      await this.eventModel.findByIdAndUpdate(eventId, {
        validationStatus: ProjectValidation.FIRST_VALIDATION,
        firstValidatedBy,
        closedBy: null,
        updatedBy: userId,
      });

      return { id: eventId, message: 'Event reopened successfully' };
    }

  async findAll(actorId: string, actorRole: UserRole) {
    let filter: Record<string, unknown> =
      actorRole === UserRole.ADMIN
        ? {}
        : {
            $or: [
              { isPrivate: false },
              { createdBy: actorId },
              { participants: actorId },
            ],
          };

    if (actorRole === UserRole.ADMIN) {
      // El ocultamiento de eventos solo aplica a la vista de administradores.
      const canClose = await this.canCloseElementsPermission(actorId);
      if (!canClose) {
        filter = { ...filter, isHidden: { $ne: true } };
      }
    }

    return this.eventModel
      .find(filter)
      .populate('participants')
      .populate('createdBy')
      .populate('updatedBy')
      .populate('firstValidatedBy')
      .populate('closedBy')
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
      .populate('firstValidatedBy')
      .populate('closedBy')
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

    if (actorRole === UserRole.ADMIN && (event as unknown as { isHidden?: boolean }).isHidden) {
      const canClose = await this.canCloseElementsPermission(actorId);
      if (!canClose) {
        throw new NotFoundException(`Event with ID: ${id} not found`);
      }
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
      const existingEvent = await this.eventModel.findById(id).select('createdBy validationStatus');

      if (!existingEvent) {
        throw new NotFoundException(`Event with ID: ${id} not found`);
      }
      if (existingEvent.get('validationStatus') === ProjectValidation.FINAL_VALIDATION) {
        throw new ForbiddenException('The event is closed. Reopen it before modifying it.');
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
      if (err instanceof ForbiddenException || err instanceof NotFoundException) {
        throw err;
      }
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
    if (
      (event.get?.('validationStatus') ?? event.validationStatus) ===
      ProjectValidation.FINAL_VALIDATION
    ) {
      throw new ForbiddenException('The event is closed. Reopen it before modifying it.');
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
   * Hides an event from the admin view for users without the close-project permission.
   * @param eventId The unique identifier of the event.
   * @param userId The ID of the user hiding the event.
   */
  async hideEvent(eventId: string, userId: string) {
    const canClose = await this.canCloseElementsPermission(userId);

    if (!canClose) {
      throw new ForbiddenException('This user is not authorized to hide events.');
    }

    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID: ${eventId} not found`);
    }
    if (
      (event.get?.('validationStatus') ?? event.validationStatus) ===
      ProjectValidation.FINAL_VALIDATION
    ) {
      throw new ForbiddenException('The event is closed. Reopen it before modifying it.');
    }

    if (event.get('isHidden')) {
      throw new BadRequestException('The event is already hidden.');
    }

    await this.eventModel.findByIdAndUpdate(eventId, {
      isHidden: true,
      hiddenBy: new Types.ObjectId(userId),
      updatedBy: userId,
    });

    return { id: eventId, message: 'Event hidden successfully' };
  }

  /**
   * Reveals a previously hidden event.
   * @param eventId The unique identifier of the event.
   * @param userId The ID of the user unhiding the event.
   */
  async unhideEvent(eventId: string, userId: string) {
    const canClose = await this.canCloseElementsPermission(userId);

    if (!canClose) {
      throw new ForbiddenException('This user is not authorized to unhide events.');
    }

    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID: ${eventId} not found`);
    }
    if (
      (event.get?.('validationStatus') ?? event.validationStatus) ===
      ProjectValidation.FINAL_VALIDATION
    ) {
      throw new ForbiddenException('The event is closed. Reopen it before modifying it.');
    }

    if (!event.get('isHidden')) {
      throw new BadRequestException('The event is not hidden.');
    }

    await this.eventModel.findByIdAndUpdate(eventId, {
      isHidden: false,
      hiddenBy: null,
      updatedBy: userId,
    });

    return { id: eventId, message: 'Event unhidden successfully' };
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
    if (
      (event.get?.('validationStatus') ?? event.validationStatus) ===
      ProjectValidation.FINAL_VALIDATION
    ) {
      throw new ForbiddenException('The event is closed. Reopen it before modifying it.');
    }

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
    const event = await this.eventModel
      .findById(eventId)
      .select('createdBy participants');

    if (!event) {
      throw new NotFoundException(`Event with ID: ${eventId} not found`);
    }
    if (
      (event.get?.('validationStatus') ?? event.validationStatus) ===
      ProjectValidation.FINAL_VALIDATION
    ) {
      throw new ForbiddenException('The event is closed. Reopen it before modifying it.');
    }

    const isParticipant = event.participants?.some((participant) => {
      const participantId = this.toId(
        (participant as { _id?: unknown })._id ?? participant,
      );
      return participantId === userId;
    });

    if (!isParticipant) {
      throw new BadRequestException('The user is not a participant in this event.');
    }

    const isSelfRemoval = updater === userId;

    if (!isSelfRemoval) {
      this.ensureCanManageEvent(
        event,
        updater,
        actorRole,
        AccessDeniedReason.EVENT_MANAGE_NOT_OWNER,
        'You are not allowed to manage participants for this event.',
      );
    }

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
      await this.ensureEventIsOpen(eventId);
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
