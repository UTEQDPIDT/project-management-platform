import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EntityType, UserRole } from '@repo/types';
import mongoose from 'mongoose';
import { FilesService } from './files.service';

describe('FilesService', () => {
  let service: FilesService;

  const fileModelMock = {
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
  };

  const projectModelMock = {
    findById: jest.fn(),
  };

  const activityModelMock = {
    findById: jest.fn(),
  };

  const productModelMock = {
    findById: jest.fn(),
  };

  const bucketMock = {
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();

    service = Object.create(FilesService.prototype) as FilesService;
    (service as unknown as { fileModel: typeof fileModelMock }).fileModel = fileModelMock;
    (service as unknown as { projectModel: typeof projectModelMock }).projectModel = projectModelMock;
    (service as unknown as { activityModel: typeof activityModelMock }).activityModel = activityModelMock;
    (service as unknown as { productModel: typeof productModelMock }).productModel = productModelMock;
    (service as unknown as { bucket: typeof bucketMock }).bucket = bucketMock;
  });

  it('should delete file when actor owns the file', async () => {
    fileModelMock.findById.mockResolvedValue({
      _id: 'f1',
      owner: { toString: () => 'u1' },
      entityId: { toString: () => 'e1' },
      entityType: EntityType.EVENT,
      gridFsId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    });
    fileModelMock.findByIdAndDelete.mockResolvedValue({ _id: 'f1' });

    const result = await service.deleteFile('f1', 'u1', UserRole.USER);

    expect(result).toEqual({ _id: 'f1' });
    expect(fileModelMock.findByIdAndDelete).toHaveBeenCalledWith('f1');
    expect(bucketMock.delete).toHaveBeenCalledTimes(1);
  });

  it('should allow admin to delete any file', async () => {
    fileModelMock.findById.mockResolvedValue({
      _id: 'f1',
      owner: { toString: () => 'owner-1' },
      entityId: { toString: () => 'e1' },
      entityType: EntityType.EVENT,
      gridFsId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    });
    fileModelMock.findByIdAndDelete.mockResolvedValue({ _id: 'f1' });

    await service.deleteFile('f1', 'admin-user', UserRole.ADMIN);

    expect(fileModelMock.findByIdAndDelete).toHaveBeenCalledWith('f1');
  });

  it('should reject file deletion when actor is not owner and not admin', async () => {
    fileModelMock.findById.mockResolvedValue({
      _id: 'f1',
      owner: { toString: () => 'u1' },
      entityId: { toString: () => 'e1' },
      entityType: EntityType.EVENT,
      gridFsId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    });

    await expect(
      service.deleteFile('f1', 'u2', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(fileModelMock.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('should allow active team member to delete a project-backed file', async () => {
    fileModelMock.findById.mockResolvedValue({
      _id: 'f1',
      owner: { toString: () => 'u1' },
      entityId: { toString: () => 'activity-1' },
      entityType: EntityType.ACTIVITY,
      gridFsId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    });
    activityModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        entityType: EntityType.PROJECT,
        entityId: { toString: () => 'project-1' },
      }),
    });
    projectModelMock.findById
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({
            owner: { toString: () => 'owner-1' },
            team: {
              memberships: [
                { user: { toString: () => 'team-user' }, status: 'ACTIVE' },
              ],
            },
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          status: 'PENDING',
          validationStatus: null,
        }),
      });
    fileModelMock.findByIdAndDelete.mockResolvedValue({ _id: 'f1' });

    await service.deleteFile('f1', 'team-user', UserRole.USER);

    expect(fileModelMock.findByIdAndDelete).toHaveBeenCalledWith('f1');
  });

  it('should allow assigned user when activity entityId is populated object', async () => {
    fileModelMock.findById.mockResolvedValue({
      _id: 'f1',
      owner: { toString: () => 'u1' },
      entityId: { toString: () => 'activity-1' },
      entityType: EntityType.ACTIVITY,
      gridFsId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    });

    activityModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        entityType: EntityType.PROJECT,
        entityId: { _id: { toHexString: () => '507f1f77bcf86cd799439012' } },
      }),
    });

    projectModelMock.findById
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({
            owner: { toString: () => 'owner-1' },
            team: {
              memberships: [
                { user: { _id: 'team-user' }, status: 'ACTIVE' },
              ],
            },
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          status: 'PENDING',
          validationStatus: null,
        }),
      });

    fileModelMock.findByIdAndDelete.mockResolvedValue({ _id: 'f1' });

    await service.deleteFile('f1', 'team-user', UserRole.USER);

    expect(fileModelMock.findByIdAndDelete).toHaveBeenCalledWith('f1');
  });

  it('should allow assigned user for legacy plural entity types', async () => {
    fileModelMock.findById.mockResolvedValue({
      _id: 'f1',
      owner: { toString: () => 'u1' },
      entityId: { toString: () => 'activity-legacy' },
      entityType: 'activities',
      gridFsId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    });

    activityModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        entityType: 'projects',
        entityId: { toString: () => 'project-legacy' },
      }),
    });

    projectModelMock.findById
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({
            owner: { toString: () => 'owner-1' },
            team: {
              memberships: [{ user: { _id: 'team-user' }, status: 'ACTIVE' }],
            },
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          status: 'PENDING',
          validationStatus: null,
        }),
      });

    fileModelMock.findByIdAndDelete.mockResolvedValue({ _id: 'f1' });

    await service.deleteFile('f1', 'team-user', UserRole.USER);

    expect(fileModelMock.findByIdAndDelete).toHaveBeenCalledWith('f1');
  });

  it('should allow assigned user when file entityType is legacy unknown but entityId is activity', async () => {
    fileModelMock.findById.mockResolvedValue({
      _id: 'f1',
      owner: { toString: () => 'u1' },
      entityId: { toString: () => 'activity-legacy-unknown' },
      entityType: 'activity_evidence_legacy',
      gridFsId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    });

    activityModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        entityType: EntityType.PROJECT,
        entityId: { toString: () => 'project-legacy-unknown' },
      }),
    });

    projectModelMock.findById
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({
            owner: { toString: () => 'owner-1' },
            team: {
              memberships: [{ user: { _id: 'team-user' }, status: 'ACTIVE' }],
            },
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          status: 'PENDING',
          validationStatus: null,
        }),
      });

    fileModelMock.findByIdAndDelete.mockResolvedValue({ _id: 'f1' });

    await service.deleteFile('f1', 'team-user', UserRole.USER);

    expect(fileModelMock.findByIdAndDelete).toHaveBeenCalledWith('f1');
  });

  it('should reject file deletion when owner metadata is missing', async () => {
    fileModelMock.findById.mockResolvedValue({
      _id: 'f1',
      owner: null,
      entityId: { toString: () => 'e1' },
      entityType: EntityType.EVENT,
      gridFsId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    });

    await expect(
      service.deleteFile('f1', 'u1', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should throw NotFoundException when file does not exist', async () => {
    fileModelMock.findById.mockResolvedValue(null);

    await expect(
      service.deleteFile('missing', 'u1', UserRole.USER),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should delete all owner files and return deleted count', async () => {
    const files = [
      {
        _id: { toString: () => 'f1' },
        owner: { toString: () => 'u1' },
        entityId: { toString: () => 'e1' },
        entityType: EntityType.EVENT,
        gridFsId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      },
      {
        _id: { toString: () => 'f2' },
        owner: { toString: () => 'u1' },
        entityId: { toString: () => 'e2' },
        entityType: EntityType.EVENT,
        gridFsId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      },
    ];

    fileModelMock.find.mockResolvedValue(files);
    fileModelMock.findById.mockImplementation(async (id: string) => {
      if (id === 'f1') return files[0];
      if (id === 'f2') return files[1];
      return null;
    });
    fileModelMock.findByIdAndDelete.mockResolvedValue({ _id: 'deleted' });

    const result = await service.deleteFilesByOwner('u1', 'u1', UserRole.USER);

    expect(result).toEqual({
      message: 'Files deleted successfully',
      deletedCount: 2,
    });
    expect(fileModelMock.find).toHaveBeenCalledWith({ owner: 'u1' });
    expect(fileModelMock.findByIdAndDelete).toHaveBeenCalledTimes(2);
  });

  it('should reject owner bulk deletion for unauthorized actor', async () => {
    await expect(
      service.deleteFilesByOwner('u1', 'u2', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
