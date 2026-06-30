import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { Activity } from '../schemas/activities.schema';
import { FilesService } from '../files/files.service';
import { ProjectsService } from '../projects/projects.service';
import { EntityType, Status } from '@repo/types';
import { UpdateActivityDto } from './dto/update-activity.dto';

describe('ActivitiesService', () => {
  let service: ActivitiesService;

  const activityModelMock = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const filesServiceMock = {
    activityHasEvidence: jest.fn(),
    findFilesForEntity: jest.fn(),
    deleteFiles: jest.fn(),
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
    activityModelMock.findById.mockResolvedValue({
      _id: 'a1',
      status: Status.PENDING,
      entityType: EntityType.PROJECT,
      entityId: 'p1',
    });
    filesServiceMock.activityHasEvidence.mockResolvedValue(true);
    activityModelMock.findByIdAndUpdate.mockResolvedValue({ _id: 'a1' });

    const updateDto: UpdateActivityDto = { status: Status.COMPLETED };

    await service.update('a1', updateDto, 'user-1');

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

    await service.update('a1', updateDto, 'user-1');

    expect(projectsServiceMock.recomputeProjectStatus).not.toHaveBeenCalled();
  });

  it('should block removing a project activity when only 3 activities remain', async () => {
    activityModelMock.findById.mockResolvedValue({
      _id: 'a1',
      entityType: EntityType.PROJECT,
      entityId: 'p1',
    });
    filesServiceMock.findFilesForEntity.mockResolvedValue([]);
    activityModelMock.countDocuments.mockResolvedValue(3);

    await expect(service.remove('a1')).rejects.toBeInstanceOf(BadRequestException);
    expect(activityModelMock.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('should remove a project activity and recompute status when more than 3 activities remain', async () => {
    activityModelMock.findById.mockResolvedValue({
      _id: 'a1',
      entityType: EntityType.PROJECT,
      entityId: 'p1',
    });
    filesServiceMock.findFilesForEntity.mockResolvedValue([]);
    activityModelMock.countDocuments.mockResolvedValue(4);
    activityModelMock.findByIdAndDelete.mockResolvedValue({ _id: 'a1' });

    await service.remove('a1');

    expect(activityModelMock.findByIdAndDelete).toHaveBeenCalledWith('a1');
    expect(projectsServiceMock.recomputeProjectStatus).toHaveBeenCalledWith('p1');
  });
});
