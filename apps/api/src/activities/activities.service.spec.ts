import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { Activity } from '../schemas/activities.schema';
import { FilesService } from '../files/files.service';
import { ProjectsService } from '../projects/projects.service';
import { EntityType, Status, UserRole } from '@repo/types';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Project } from '../schemas/project.schema';
import { Event } from '../schemas/event.schema';

describe('ActivitiesService', () => {
  let service: ActivitiesService;

  const activityModelMock = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const projectModelMock = {
    findById: jest.fn(),
  };

  const eventModelMock = {
    findById: jest.fn(),
  };

  const filesServiceMock = {
    activityHasEvidence: jest.fn(),
    findFilesForEntity: jest.fn(),
    deleteFilesForResource: jest.fn(),
  };

  const projectsServiceMock = {
    recomputeProjectStatus: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        { provide: getModelToken(Activity.name), useValue: activityModelMock },
        { provide: getModelToken(Project.name), useValue: projectModelMock },
        { provide: getModelToken(Event.name), useValue: eventModelMock },
        { provide: FilesService, useValue: filesServiceMock },
        { provide: ProjectsService, useValue: projectsServiceMock },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should recompute project status after updating a project activity', async () => {
    projectModelMock.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          owner: { toString: () => 'user-1' },
          team: { memberships: [] },
          status: Status.PENDING,
          validationStatus: null,
        }),
      }),
    });

    activityModelMock.findById.mockResolvedValue({
      _id: 'a1',
      status: Status.PENDING,
      entityType: EntityType.PROJECT,
      entityId: 'p1',
      createdBy: { toString: () => 'owner-1' },
    });
    filesServiceMock.activityHasEvidence.mockResolvedValue(true);
    activityModelMock.findByIdAndUpdate.mockResolvedValue({ _id: 'a1' });

    const updateDto: UpdateActivityDto = { status: Status.COMPLETED };

    await service.update('a1', updateDto, 'user-1', UserRole.USER);

    expect(projectsServiceMock.recomputeProjectStatus).toHaveBeenCalledWith('p1');
  });

  it('should not recompute project status for non-project activity update', async () => {
    activityModelMock.findById.mockResolvedValue({
      _id: 'a1',
      status: Status.PENDING,
      entityType: EntityType.EVENT,
      entityId: 'e1',
    });
    activityModelMock.findByIdAndUpdate.mockResolvedValue({ _id: 'a1' });

    const updateDto: UpdateActivityDto = { status: Status.PENDING };

    await service.update('a1', updateDto, 'user-1', UserRole.USER);

    expect(projectsServiceMock.recomputeProjectStatus).not.toHaveBeenCalled();
  });

  it('should block removing a project activity when only 3 activities remain', async () => {
    projectModelMock.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          owner: { toString: () => 'admin-user' },
          team: { memberships: [] },
          status: Status.PENDING,
          validationStatus: null,
        }),
      }),
    });

    activityModelMock.findById.mockResolvedValue({
      _id: 'a1',
      entityType: EntityType.PROJECT,
      entityId: 'p1',
      createdBy: { toString: () => 'admin-user' },
    });
    filesServiceMock.findFilesForEntity.mockResolvedValue([]);
    activityModelMock.countDocuments.mockResolvedValue(3);

    await expect(
      service.remove('a1', 'admin-user', UserRole.ADMIN),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(activityModelMock.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('should remove a project activity and recompute status when more than 3 activities remain', async () => {
    projectModelMock.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          owner: { toString: () => 'admin-user' },
          team: { memberships: [] },
          status: Status.PENDING,
          validationStatus: null,
        }),
      }),
    });

    activityModelMock.findById.mockResolvedValue({
      _id: 'a1',
      entityType: EntityType.PROJECT,
      entityId: 'p1',
      createdBy: { toString: () => 'admin-user' },
    });
    filesServiceMock.findFilesForEntity.mockResolvedValue([]);
    activityModelMock.countDocuments.mockResolvedValue(4);
    activityModelMock.findByIdAndDelete.mockResolvedValue({ _id: 'a1' });

    await service.remove('a1', 'admin-user', UserRole.ADMIN);

    expect(activityModelMock.findByIdAndDelete).toHaveBeenCalledWith('a1');
    expect(projectsServiceMock.recomputeProjectStatus).toHaveBeenCalledWith('p1');
  });

  it('should reject removal for non-owner in project activities', async () => {
    projectModelMock.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          owner: { toString: () => 'owner-user' },
          team: { memberships: [] },
        }),
      }),
    });

    activityModelMock.findById.mockResolvedValue({
      _id: 'a1',
      entityType: EntityType.PROJECT,
      entityId: 'p1',
      createdBy: { toString: () => 'creator-1' },
    });

    await expect(
      service.remove('a1', 'intruder-user', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should allow active team member to update a project activity', async () => {
    projectModelMock.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          owner: { toString: () => 'owner-user' },
          team: {
            memberships: [
              { user: { toString: () => 'team-user' }, status: 'ACTIVE' },
            ],
          },
          status: Status.PENDING,
          validationStatus: null,
        }),
      }),
    });
    activityModelMock.findById.mockResolvedValue({
      _id: 'a1',
      status: Status.PENDING,
      entityType: EntityType.PROJECT,
      entityId: 'p1',
      createdBy: { toString: () => 'creator-1' },
    });
    activityModelMock.findByIdAndUpdate.mockResolvedValue({ _id: 'a1' });

    await service.update('a1', { name: 'Updated' }, 'team-user', UserRole.USER);

    expect(activityModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
      'a1',
      expect.objectContaining({ updatedBy: 'team-user' }),
      { new: true },
    );
  });

  it('should reject removal for non-owner in event activities', async () => {
    eventModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        createdBy: { toString: () => 'event-owner' },
      }),
    });

    activityModelMock.findById.mockResolvedValue({
      _id: 'a1',
      entityType: EntityType.EVENT,
      entityId: 'e1',
      createdBy: { toString: () => 'creator-1' },
    });

    await expect(
      service.remove('a1', 'intruder-user', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
