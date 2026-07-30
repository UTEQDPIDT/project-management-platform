import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { Event } from '../schemas/event.schema';
import { User } from '../schemas/user.schema';
import { Team } from '../schemas/team.schema';
import { Project } from '../schemas/project.schema';

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
});
