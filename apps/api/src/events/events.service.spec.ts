import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@repo/types';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;

  const eventModelMock = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const filesServiceMock = {
    findFilesForEntity: jest.fn(),
    deleteFilesForResource: jest.fn(),
  };

  const activitiesServiceMock = {
    deleteManyByEntity: jest.fn(),
  };

  const sessionMock = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  const connectionMock = {
    startSession: jest.fn().mockResolvedValue(sessionMock),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = Object.create(EventsService.prototype) as EventsService;
    (service as unknown as { eventModel: typeof eventModelMock }).eventModel = eventModelMock;
    (service as unknown as { filesService: typeof filesServiceMock }).filesService = filesServiceMock;
    (service as unknown as { activitiesService: typeof activitiesServiceMock }).activitiesService =
      activitiesServiceMock;
    (service as unknown as { connection: typeof connectionMock }).connection = connectionMock;
  });

  it('should reject remove when actor is not event owner and not admin', async () => {
    eventModelMock.findById.mockResolvedValue({
      createdBy: { toString: () => 'owner-1' },
    });

    await expect(
      service.remove('event-1', 'user-2', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should reject remove when event owner metadata is missing', async () => {
    eventModelMock.findById.mockResolvedValue({
      createdBy: null,
    });

    await expect(
      service.remove('event-1', 'user-1', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should allow admin remove and cleanup related data', async () => {
    eventModelMock.findById.mockResolvedValue({
      createdBy: { toString: () => 'owner-1' },
    });
    eventModelMock.findByIdAndDelete.mockResolvedValue({ _id: 'event-1' });
    filesServiceMock.findFilesForEntity.mockResolvedValue([]);

    const result = await service.remove('event-1', 'admin-1', UserRole.ADMIN);

    expect(result).toEqual({ id: 'event-1', message: 'Event deleted successfully' });
    expect(activitiesServiceMock.deleteManyByEntity).toHaveBeenCalledWith(
      'event-1',
      sessionMock,
    );
    expect(filesServiceMock.deleteFilesForResource).toHaveBeenCalledWith([]);
    expect(sessionMock.commitTransaction).toHaveBeenCalledTimes(1);
  });

  it('should throw when event does not exist', async () => {
    eventModelMock.findById.mockResolvedValue(null);

    await expect(
      service.remove('event-404', 'user-1', UserRole.USER),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should allow a normal user to leave their own event participation', async () => {
    eventModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        createdBy: { toString: () => 'owner-1' },
        participants: [{ toString: () => 'user-2' }],
      }),
    });

    const result = await service.removeParticipant(
      'event-1',
      'user-2',
      'user-2',
      UserRole.USER,
    );

    expect(result).toEqual({
      removedParticipant: 'user-2',
      message: 'Participants removed successfully from event with id event-1',
    });
    expect(eventModelMock.findByIdAndUpdate).toHaveBeenCalledWith('event-1', {
      $pull: { participants: 'user-2' },
      updatedBy: 'user-2',
    });
  });

  it('should reject participant removal by non-owner when removing another user', async () => {
    eventModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        createdBy: { toString: () => 'owner-1' },
        participants: [{ toString: () => 'user-2' }],
      }),
    });

    await expect(
      service.removeParticipant('event-1', 'user-2', 'user-3', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should reject participant removal when target user is not in event', async () => {
    eventModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        createdBy: { toString: () => 'owner-1' },
        participants: [{ toString: () => 'user-2' }],
      }),
    });

    await expect(
      service.removeParticipant('event-1', 'user-999', 'owner-1', UserRole.USER),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
