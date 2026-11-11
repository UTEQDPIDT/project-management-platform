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

  const findQueryMock = {
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const teamModelMock = {
    findById: jest.fn().mockReturnValue(findByIdQueryMock),
    find: jest.fn().mockReturnValue(findQueryMock),
    exists: jest.fn(),
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

  it('lists public and private teams for an admin without a visibility filter', async () => {
    const teams = [
      { _id: 'public-team', isPrivate: false },
      { _id: 'private-team', isPrivate: true },
    ];
    findQueryMock.exec.mockResolvedValue(teams);

    await expect(
      service.findAll({ userId: 'admin-1', userRole: UserRole.ADMIN }),
    ).resolves.toEqual(teams);
    expect(teamModelMock.find).toHaveBeenCalledWith({});
  });

  it('keeps private teams restricted to active members for regular users', async () => {
    findQueryMock.exec.mockResolvedValue([]);

    await service.findAll({ userId: 'user-1', userRole: UserRole.USER });

    expect(teamModelMock.find).toHaveBeenCalledWith({
      $or: [
        { isPrivate: false },
        {
          memberships: {
            $elemMatch: {
              user: 'user-1',
              $or: [
                { status: 'ACTIVE' },
                { status: { $regex: /^active$/i } },
                { status: { $exists: false } },
              ],
            },
          },
        },
      ],
    });
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

    teamModelMock.exists.mockResolvedValue(true);

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

    teamModelMock.exists.mockResolvedValue(false);

    await expect(service.findOne('team-1', 'user-1', UserRole.USER)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('should not recurse infinitely for ObjectId-like membership values', async () => {
    const objectIdLike: { _id?: unknown; toString: () => string } = {
      toString: () => 'user-1',
    };
    objectIdLike._id = objectIdLike;

    findByIdQueryMock.exec.mockResolvedValue({
      _id: 'team-1',
      isPrivate: true,
      memberships: [
        {
          user: objectIdLike,
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      ],
    });

    teamModelMock.exists.mockResolvedValue(true);

    await expect(service.findOne('team-1', 'user-1', UserRole.USER)).resolves.toEqual(
      expect.objectContaining({ _id: 'team-1' }),
    );
  });
});
