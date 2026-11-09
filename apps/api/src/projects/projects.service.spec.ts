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
import {
  ImpactLevel,
  ProjectStatus,
  ProjectValidation,
  Status,
  UserRole,
} from '@repo/types';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Types } from 'mongoose';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const projectModelMock = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOneAndUpdate: jest.fn(),
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
    findById: jest.fn(),
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
    teamModelMock.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    });

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

  it.each([true, false])(
    'updates a team member selection atomically to %s',
    async (selected) => {
      const membershipId = '507f1f77bcf86cd799439011';
      projectModelMock.findById.mockResolvedValue({
        owner: 'owner-1',
        team: '507f1f77bcf86cd799439012',
        status: ProjectStatus.PENDING,
        validationStatus: ProjectValidation.UNDER_REVIEW,
      });
      const anotherMembershipId = new Types.ObjectId('507f1f77bcf86cd799439013');
      teamModelMock.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          memberships: [
            { _id: new Types.ObjectId(membershipId), status: 'ACTIVE' },
            { _id: anotherMembershipId, status: 'ACTIVE' },
          ],
        }),
      });
      projectModelMock.findOneAndUpdate.mockResolvedValue({ excludedTeamMemberships: [] });

      await service.updateMember('project-1', { membershipId, selected }, 'owner-1', UserRole.USER);

      expect(projectModelMock.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          owner: 'owner-1',
          team: '507f1f77bcf86cd799439012',
          ...(selected ? {} : {
            $or: [
              { excludedTeamMemberships: new Types.ObjectId(membershipId) },
              {
                $expr: {
                  $gt: [
                    { $size: { $setDifference: [[anotherMembershipId], { $setDifference: [{ $ifNull: ['$excludedTeamMemberships', []] }, []] }] } },
                    0,
                  ],
                },
              },
            ],
          }),
        }),
        selected
          ? { $pull: { excludedTeamMemberships: new Types.ObjectId(membershipId) } }
          : { $addToSet: { excludedTeamMemberships: new Types.ObjectId(membershipId) } },
        { new: true },
      );
    },
  );

  it('rejects unauthorized and finalized project member changes', async () => {
    const membershipId = '507f1f77bcf86cd799439011';
    projectModelMock.findById.mockResolvedValue({
      owner: 'owner-1',
      team: '507f1f77bcf86cd799439012',
      status: ProjectStatus.PENDING,
      validationStatus: ProjectValidation.FINAL_VALIDATION,
    });
    await expect(
      service.updateMember('project-1', { membershipId, selected: false }, 'member', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.updateMember('project-1', { membershipId, selected: false }, 'owner-1', UserRole.USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(projectModelMock.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it.each([UserRole.USER, UserRole.ADMIN])(
    'rejects creator deselection by %s',
    async (role) => {
      const membershipId = new Types.ObjectId('507f1f77bcf86cd799439011');
      projectModelMock.findById.mockResolvedValue({
        owner: 'owner-1',
        team: '507f1f77bcf86cd799439012',
        status: ProjectStatus.PENDING,
      });
      teamModelMock.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          memberships: [{ _id: membershipId, user: 'owner-1', status: 'ACTIVE' }],
        }),
      });
      await expect(
        service.updateMember(
          'project-1',
          { membershipId: membershipId.toString(), selected: false },
          role === UserRole.ADMIN ? 'admin' : 'owner-1',
          role,
        ),
      ).rejects.toThrow('El creador del proyecto debe permanecer seleccionado.');
      expect(projectModelMock.findOneAndUpdate).not.toHaveBeenCalled();
    },
  );

  it('counts an already excluded creator when deselecting another member', async () => {
    const membershipId = new Types.ObjectId('507f1f77bcf86cd799439011');
    const creatorId = new Types.ObjectId('507f1f77bcf86cd799439013');
    projectModelMock.findById.mockResolvedValue({
      owner: 'owner-1',
      team: '507f1f77bcf86cd799439012',
      status: ProjectStatus.PENDING,
      excludedTeamMemberships: [creatorId],
    });
    teamModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        memberships: [
          { _id: creatorId, user: 'owner-1', status: 'ACTIVE' },
          { _id: membershipId, user: 'other', status: 'ACTIVE' },
        ],
      }),
    });
    projectModelMock.findOneAndUpdate.mockResolvedValue({ excludedTeamMemberships: [creatorId, membershipId] });

    await service.updateMember(
      'project-1',
      { membershipId: membershipId.toString(), selected: false },
      'owner-1',
      UserRole.USER,
    );
    expect(projectModelMock.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.arrayContaining([
          { $expr: { $gt: [
            { $size: { $setDifference: [
              [creatorId],
              { $setDifference: [{ $ifNull: ['$excludedTeamMemberships', []] }, [creatorId]] },
            ] } },
            0,
          ] } },
        ]),
      }),
      expect.any(Object),
      { new: true },
    );
  });

  it('rejects selection of a membership outside the project team', async () => {
    projectModelMock.findById.mockResolvedValue({
      owner: 'owner-1',
      team: '507f1f77bcf86cd799439012',
      status: ProjectStatus.PENDING,
    });
    teamModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ memberships: [] }),
    });
    await expect(
      service.updateMember(
        'project-1',
        { membershipId: '507f1f77bcf86cd799439011', selected: false },
        'owner-1',
        UserRole.USER,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(projectModelMock.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('rejects deselecting the last selected member', async () => {
    const membershipId = new Types.ObjectId('507f1f77bcf86cd799439011');
    const project = {
      owner: 'owner-1',
      team: '507f1f77bcf86cd799439012',
      status: ProjectStatus.PENDING,
    };
    projectModelMock.findById.mockResolvedValue(project);
    teamModelMock.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        memberships: [{ _id: membershipId, status: 'ACTIVE' }],
      }),
    });
    projectModelMock.findOneAndUpdate.mockResolvedValue(null);

    await expect(
      service.updateMember(
        'project-1',
        { membershipId: membershipId.toString(), selected: false },
        'owner-1',
        UserRole.USER,
      ),
    ).rejects.toThrow('Debe haber al menos un integrante seleccionado en el proyecto.');
  });

  it('should create a project with PENDING status, UNDER_REVIEW validation, and activities', async () => {
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
    expect(createPayload.validationStatus).toBe(ProjectValidation.UNDER_REVIEW);
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
    const teamIds = [{
      _id: 'team-1',
      memberships: [{ _id: 'membership-1', user: 'user-1', status: 'ACTIVE' }],
    }];
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
      $or: [
        { owner: 'user-1' },
        { team: 'team-1', excludedTeamMemberships: { $ne: 'membership-1' } },
      ],
    });
    expect(userModelMock.findById).not.toHaveBeenCalled();
    expect(result).toEqual([{ _id: 'project-1' }]);
  });

  it('scopes team project listings to selected memberships and ownership', async () => {
    teamModelMock.exists.mockResolvedValue(true);
    teamModelMock.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{
          _id: 'team-1',
          memberships: [{ _id: 'membership-1', user: 'user-1', status: 'ACTIVE' }],
        }]),
      }),
    });
    projectModelMock.find.mockResolvedValue([]);

    await service.findByTeam('team-1', 'user-1', UserRole.USER);
    expect(projectModelMock.find).toHaveBeenCalledWith({
      team: 'team-1',
      $or: [
        { owner: 'user-1' },
        { team: 'team-1', excludedTeamMemberships: { $ne: 'membership-1' } },
      ],
    });
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

  it('should normalize populated team document before membership exists lookup', async () => {
    const populatedTeam = {
      _id: { toString: () => '6a0e0bf2e7c5277d3e3b2322' },
      toString: () =>
        "{ _id: new ObjectId('6a0e0bf2e7c5277d3e3b2322'), teamName: 'Equipo Prueba' }",
    };
    const project = {
      _id: { toString: () => 'project-1' },
      owner: { toString: () => 'owner-1' },
      team: populatedTeam,
    };
    const populate = jest.fn((path: unknown) =>
      path === 'closedBy' ? Promise.resolve(project) : query,
    );
    const query = { populate };

    projectModelMock.findById.mockReturnValue(query);
    teamModelMock.exists.mockResolvedValue(true);

    await expect(
      service.findOne('project-1', 'user-2', UserRole.USER),
    ).resolves.toEqual(project);

    expect(teamModelMock.exists).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: '6a0e0bf2e7c5277d3e3b2322',
        memberships: {
          $elemMatch: expect.objectContaining({
            user: 'user-2',
          }),
        },
      }),
    );
  });

  it('checks excluded membership IDs when reading a project', async () => {
    const membershipId = new Types.ObjectId();
    const project = {
      _id: 'project-1',
      owner: 'owner-1',
      team: 'team-1',
      excludedTeamMemberships: [membershipId],
    };
    const populate = jest.fn((path: unknown) =>
      path === 'closedBy' ? Promise.resolve(project) : query,
    );
    const query = { populate };
    projectModelMock.findById.mockReturnValue(query);
    teamModelMock.exists.mockResolvedValue(false);

    await expect(service.findOne('project-1', 'user-2', UserRole.USER))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(teamModelMock.exists).toHaveBeenCalledWith(
      expect.objectContaining({
        memberships: expect.objectContaining({
          $elemMatch: expect.objectContaining({ _id: { $nin: [membershipId] } }),
        }),
      }),
    );
  });
});
