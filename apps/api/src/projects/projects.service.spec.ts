import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Project } from '../schemas/project.schema';
import { ProjectsService } from './projects.service';
import { ActivitiesService } from '../activities/activities.service';
import { FilesService } from '../files/files.service';
import { ProductsService } from '../products/products.service';
import { ImpactLevel, ProjectStatus, Status } from '@repo/types';
import { CreateProjectDto } from './dto/create-project.dto';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const projectModelMock = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const activitiesServiceMock = {
    createOnBulk: jest.fn(),
    findByEntityId: jest.fn(),
    deleteManyByEntity: jest.fn(),
  };

  const filesServiceMock = {
    findFilesForEntity: jest.fn(),
    deleteFiles: jest.fn(),
  };

  const productsServiceMock = {
    deleteMany: jest.fn(),
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

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getConnectionToken(), useValue: connectionMock },
        { provide: getModelToken(Project.name), useValue: projectModelMock },
        { provide: ActivitiesService, useValue: activitiesServiceMock },
        { provide: FilesService, useValue: filesServiceMock },
        { provide: ProductsService, useValue: productsServiceMock },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a project with PENDING status and activities', async () => {
    projectModelMock.create.mockResolvedValue([{ _id: 'project-1' }]);
    activitiesServiceMock.createOnBulk.mockResolvedValue([]);

    const dto = {
      name: 'Proyecto test',
      objective: 'Objetivo',
      trlRating: 2,
      impactLevel: ImpactLevel.LOCAL,
      activities: [{ name: 'A1' }, { name: 'A2' }, { name: 'A3' }],
    } as unknown as CreateProjectDto;

    await service.create(dto, 'user-1');

    expect(projectModelMock.create).toHaveBeenCalledTimes(1);
    const createPayload = projectModelMock.create.mock.calls[0][0][0];
    expect(createPayload.status).toBe(ProjectStatus.PENDING);
    expect(activitiesServiceMock.createOnBulk).toHaveBeenCalledWith(
      dto.activities,
      'user-1',
      'project-1',
      'project',
      sessionMock,
    );
  });

  it('should reject creation when activities are fewer than 3', async () => {
    const dto = {
      name: 'Proyecto test',
      objective: 'Objetivo',
      trlRating: 2,
      impactLevel: ImpactLevel.LOCAL,
      activities: [{ name: 'A1' }, { name: 'A2' }],
    } as unknown as CreateProjectDto;

    await expect(service.create(dto, 'user-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(projectModelMock.create).not.toHaveBeenCalled();
  });

  it('should reject creation when any activity name is empty', async () => {
    const dto = {
      name: 'Proyecto test',
      objective: 'Objetivo',
      trlRating: 2,
      impactLevel: ImpactLevel.LOCAL,
      activities: [{ name: 'A1' }, { name: '   ' }, { name: 'A3' }],
    } as unknown as CreateProjectDto;

    await expect(service.create(dto, 'user-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(projectModelMock.create).not.toHaveBeenCalled();
  });

  it('should set project status to PENDING when all activities are pending', async () => {
    projectModelMock.findById.mockResolvedValue({ _id: 'project-1' });
    activitiesServiceMock.findByEntityId.mockResolvedValue([
      { status: Status.PENDING },
      { status: Status.PENDING },
      { status: Status.PENDING },
    ]);

    const status = await service.recomputeProjectStatus('project-1');

    expect(status).toBe(ProjectStatus.PENDING);
    expect(projectModelMock.findByIdAndUpdate).toHaveBeenCalledWith('project-1', {
      status: ProjectStatus.PENDING,
    });
  });

  it('should set project status to COMPLETED when all activities are completed', async () => {
    projectModelMock.findById.mockResolvedValue({ _id: 'project-1' });
    activitiesServiceMock.findByEntityId.mockResolvedValue([
      { status: Status.COMPLETED },
      { status: Status.COMPLETED },
      { status: Status.COMPLETED },
    ]);

    const status = await service.recomputeProjectStatus('project-1');

    expect(status).toBe(ProjectStatus.COMPLETED);
    expect(projectModelMock.findByIdAndUpdate).toHaveBeenCalledWith('project-1', {
      status: ProjectStatus.COMPLETED,
    });
  });

  it('should set project status to IN_PROGRESS when activities are mixed', async () => {
    projectModelMock.findById.mockResolvedValue({ _id: 'project-1' });
    activitiesServiceMock.findByEntityId.mockResolvedValue([
      { status: Status.PENDING },
      { status: Status.COMPLETED },
      { status: Status.PROGRESS },
    ]);

    const status = await service.recomputeProjectStatus('project-1');

    expect(status).toBe(ProjectStatus.IN_PROGRESS);
    expect(projectModelMock.findByIdAndUpdate).toHaveBeenCalledWith('project-1', {
      status: ProjectStatus.IN_PROGRESS,
    });
  });

  it('should throw when recomputing status with fewer than 3 activities', async () => {
    projectModelMock.findById.mockResolvedValue({ _id: 'project-1' });
    activitiesServiceMock.findByEntityId.mockResolvedValue([
      { status: Status.PENDING },
      { status: Status.PENDING },
    ]);

    await expect(service.recomputeProjectStatus('project-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should throw when recomputing status for unknown project', async () => {
    projectModelMock.findById.mockResolvedValue(null);

    await expect(service.recomputeProjectStatus('project-404')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
