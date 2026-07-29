import { ForbiddenException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@repo/types';
import { Team } from '../schemas/team.schema';
import { TeamsService } from './teams.service';

describe('TeamsService', () => {
  let service: TeamsService;

  const findByIdQueryMock = {
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const teamModelMock = {
    findById: jest.fn().mockReturnValue(findByIdQueryMock),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: getModelToken(Team.name), useValue: teamModelMock },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  it('should allow member to view private team when memberships.user is populated object', async () => {
    findByIdQueryMock.exec.mockResolvedValue({
      _id: 'team-1',
      isPrivate: true,
      memberships: [
        {
          user: { _id: 'user-1', givenName: 'U' },
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      ],
    });

    await expect(service.findOne('team-1', 'user-1', UserRole.USER)).resolves.toEqual(
      expect.objectContaining({ _id: 'team-1' }),
    );
  });

  it('should deny private team access when user is not a member', async () => {
    findByIdQueryMock.exec.mockResolvedValue({
      _id: 'team-1',
      isPrivate: true,
      memberships: [
        {
          user: { _id: 'other-user' },
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      ],
    });

    await expect(service.findOne('team-1', 'user-1', UserRole.USER)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
