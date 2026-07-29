import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Project } from '../schemas/project.schema';
import { User } from '../schemas/user.schema';
import { Team } from '../schemas/team.schema';
import { ProjectsService } from './projects.service';
import { ActivitiesService } from '../activities/activities.service';
import { FilesService } from '../files/files.service';
import { ProductsService } from '../products/products.service';
import { ImpactLevel, ProjectStatus, Status, UserRole } from '@repo/types';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const projectModelMock = {
    create: jest.fn(),
    find: jest.fn(),
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
    deleteFilesForResource: jest.fn(),
  };

  const productsServiceMock = {
    deleteMany: jest.fn(),
  };

  const userModelMock = {
    findById: jest.fn(),
  };

  const teamModelMock = {
    find: jest.fn(),
    exists: jest.fn(),
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
        { provide: getModelToken(User.name), useValue: userModelMock },
        { provide: getModelToken(Team.name), useValue: teamModelMock },
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
    projectModelMock.findById.mockResolvedValue({
      _id: 'project-1',
      get: jest.fn().mockReturnValue(null),
    });
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
    projectModelMock.findById.mockResolvedValue({
      _id: 'project-1',
      get: jest.fn().mockReturnValue(null),
    });
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
    projectModelMock.findById.mockResolvedValue({
      _id: 'project-1',
      get: jest.fn().mockReturnValue(null),
    });
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
    projectModelMock.findById.mockResolvedValue({
      _id: 'project-1',
      get: jest.fn().mockReturnValue(null),
    });
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

  it('should reject project update for non-owner non-admin user', async () => {
    const updateDto = {} as UpdateProjectDto;

    projectModelMock.findById.mockResolvedValue({
      owner: { toString: () => 'owner-1' },
      get: jest.fn().mockReturnValue(null),
    });

    await expect(
      service.update('p1', updateDto, 'user-2', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should allow admin project update even when not owner', async () => {
    const updateDto = { name: 'Updated' } as UpdateProjectDto;

    projectModelMock.findById.mockResolvedValue({
      owner: { toString: () => 'owner-1' },
      get: jest.fn().mockReturnValue(null),
    });
    projectModelMock.findByIdAndUpdate.mockResolvedValue({});

    await service.update('p1', updateDto, 'admin-1', UserRole.ADMIN);

    expect(projectModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ updatedBy: 'admin-1' }),
    );
  });

  it('should reject project delete for non-owner non-admin user', async () => {
    projectModelMock.findById.mockResolvedValue({
      _id: { toString: () => 'p1' },
      owner: { toString: () => 'owner-1' },
      get: jest.fn().mockReturnValue(null),
    });

    await expect(
      service.remove('p1', 'user-2', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should return scoped projects for non-admin user in findAll', async () => {
    const teamIds = [{ _id: { toString: () => 'team-1' } }];
    teamModelMock.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(teamIds),
      }),
    });

    const exec = jest.fn().mockResolvedValue([{ _id: 'project-1' }]);
    const queryChain = {
      populate: jest.fn().mockReturnThis(),
      exec,
    };
    projectModelMock.find.mockReturnValue(queryChain);

    const result = await service.findAll('user-1', UserRole.USER);

    expect(projectModelMock.find).toHaveBeenCalledWith({
      $or: [{ owner: 'user-1' }, { team: { $in: ['team-1'] } }],
    });
    expect(result).toEqual([{ _id: 'project-1' }]);
  });

  it('should throw forbidden when non-member reads project by id', async () => {
    const project = {
      _id: { toString: () => 'project-1' },
      owner: { toString: () => 'owner-1' },
      team: { toString: () => 'team-1' },
    };
    const populate = jest.fn((path: unknown) =>
      path === 'closedBy' ? Promise.resolve(project) : query,
    );
    const query = {
      populate,
    };
    projectModelMock.findById.mockReturnValue(query);

    teamModelMock.exists.mockResolvedValue(false);

    await expect(
      service.findOne('project-1', 'user-2', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should reject update when owner metadata is missing', async () => {
    const updateDto = {} as UpdateProjectDto;

    projectModelMock.findById.mockResolvedValue({
      owner: null,
      get: jest.fn().mockReturnValue(null),
    });

    await expect(
      service.update('p1', updateDto, 'user-1', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
