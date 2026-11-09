import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { Event } from '../schemas/event.schema';
import { User } from '../schemas/user.schema';
import { Team } from '../schemas/team.schema';
import { Project } from '../schemas/project.schema';
import { DashboardPeriod, UserType } from '@repo/types';

describe('DashboardService', () => {
  let service: DashboardService;

  const eventModelMock = {
    find: jest.fn(),
    aggregate: jest.fn(),
  };

  const userModelMock = {
    collection: { name: 'users' },
  };

  const teamModelMock = {
    collection: { name: 'teams' },
  };

  const projectModelMock = {
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getModelToken(Event.name), useValue: eventModelMock },
        { provide: getModelToken(User.name), useValue: userModelMock },
        { provide: getModelToken(Team.name), useValue: teamModelMock },
        { provide: getModelToken(Project.name), useValue: projectModelMock },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('filters excluded memberships and returns per-project participant totals', async () => {
    projectModelMock.countDocuments.mockResolvedValue(3);
    projectModelMock.aggregate.mockResolvedValue([
      { _id: UserType.ESTUDIANTE, count: 4 },
      { _id: UserType.MAESTRO, count: 2 },
    ]);

    const result = await service.getProjectsDashboard(DashboardPeriod.C1, 2026);
    expect(result.kpis).toEqual({
      totalProjects: 3,
      studentsInProjects: 4,
      teachersInProjects: 2,
    });
    const pipeline = projectModelMock.aggregate.mock.calls[0][0];
    expect(pipeline).toEqual(expect.arrayContaining([
      expect.objectContaining({
        $addFields: expect.objectContaining({
          activeMemberships: {
            $filter: {
              input: { $ifNull: ['$teamDoc.memberships', []] },
              as: 'membership',
              cond: {
                $and: [
                  {
                    $or: [
                      { $eq: [{ $type: '$$membership.status' }, 'missing'] },
                      { $eq: [{ $toUpper: { $trim: { input: { $ifNull: ['$$membership.status', ''] } } } }, 'ACTIVE'] },
                    ],
                  },
                  {
                    $or: [
                      { $eq: ['$$membership.user', '$owner'] },
                      { $not: [{ $in: ['$$membership._id', { $ifNull: ['$excludedTeamMemberships', []] }] }] },
                    ],
                  },
                ],
              },
            },
          },
        }),
      }),
    ]));
  });
});
