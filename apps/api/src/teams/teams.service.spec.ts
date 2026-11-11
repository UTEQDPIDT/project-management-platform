import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@repo/types';
import { Team } from '../schemas/team.schema';
import { User } from '../schemas/user.schema';
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
    create: jest.fn(),
  };

  const userModelMock = { countDocuments: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: getModelToken(Team.name), useValue: teamModelMock },
        { provide: getModelToken(User.name), useValue: userModelMock },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  it.each([{ members: [] }, { members: ['member-1'] }])('rejects creation with fewer than two members: $members', async ({ members }) => {
    await expect(service.create({ teamName: 'Team', members }, 'owner'))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(teamModelMock.create).not.toHaveBeenCalled();
  });

  it.each([
    ['owner', 'member-1'],
    ['member-1', 'member-1'],
    ['member-1', 'MEMBER-1'],
  ])('does not count the owner or duplicate IDs twice', async (...members) => {
    await expect(service.create({ teamName: 'Team', members }, 'owner'))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(teamModelMock.create).not.toHaveBeenCalled();
  });

  it('does not count collaborators toward the minimum', async () => {
    await expect(service.create({
      teamName: 'Team',
      members: ['member-1'],
      collaborators: ['collaborator-1'],
    }, 'owner')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects missing member accounts', async () => {
    userModelMock.countDocuments.mockResolvedValue(1);
    await expect(service.create({
      teamName: 'Team', members: ['member-1', 'member-2'],
    }, 'owner')).rejects.toBeInstanceOf(BadRequestException);
    expect(teamModelMock.create).not.toHaveBeenCalled();
  });

  it('creates a team with an owner and two distinct existing members', async () => {
    userModelMock.countDocuments.mockResolvedValue(2);
    teamModelMock.create.mockResolvedValue({ _id: 'team-1' });
    await expect(service.create({
      teamName: 'Team', members: ['member-1', 'member-2'],
    }, 'owner')).resolves.toEqual(expect.objectContaining({ id: 'team-1' }));
    expect(teamModelMock.create).toHaveBeenCalledWith(expect.objectContaining({
      memberships: [
        { user: 'owner', role: 'OWNER', status: 'ACTIVE' },
        { user: 'member-1', role: 'MEMBER', status: 'ACTIVE' },
        { user: 'member-2', role: 'MEMBER', status: 'ACTIVE' },
      ],
    }));
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
