import { BadRequestException } from '@nestjs/common';
import { UserRole } from '@repo/types';
import { Connection, createConnection, Model, Types } from 'mongoose';
import { Team, TeamSchema } from '../schemas/team.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { TeamsService } from './teams.service';

// These integration tests are run directly with Jest, not through Turbo.
// eslint-disable-next-line turbo/no-undeclared-env-vars
const mongoUri = process.env.TEAM_TEST_MONGODB_URI;
const describeWithMongo = mongoUri ? describe : describe.skip;

describeWithMongo('team minimum membership (MongoDB)', () => {
  let connection: Connection;
  let teams: Model<Team>;
  let users: Model<User>;
  let service: TeamsService;
  const createdIds: Types.ObjectId[] = [];
  const owner = new Types.ObjectId();
  const member1 = new Types.ObjectId();
  const member2 = new Types.ObjectId();
  const member3 = new Types.ObjectId();
  const collaborator = new Types.ObjectId();

  beforeAll(async () => {
    connection = await createConnection(mongoUri!).asPromise();
    teams = connection.model(Team.name, TeamSchema);
    users = connection.model(User.name, UserSchema);
    service = new TeamsService(teams, users);
  });

  afterAll(async () => {
    await teams.deleteMany({ _id: { $in: createdIds } });
    await connection.close();
  });

  async function makeTeam(extra: Array<{
    user: Types.ObjectId;
    role: 'MEMBER' | 'COLLABORATOR';
    status: 'ACTIVE' | 'PENDING';
  }> = []) {
    const team = await teams.create({
      teamName: `minimum-test-${new Types.ObjectId()}`,
      memberships: [
        { user: owner, role: 'OWNER', status: 'ACTIVE' },
        { user: member1, role: 'MEMBER', status: 'ACTIVE' },
        { user: member2, role: 'MEMBER', status: 'ACTIVE' },
        ...extra,
      ],
    });
    createdIds.push(team._id as Types.ObjectId);
    return team.id as string;
  }

  const remove = (teamId: string, user: Types.ObjectId) =>
    service.removeMember(teamId, user.toString(), owner.toString(), UserRole.USER);

  it('prevents removal below three; collaborators and pending members do not count', async () => {
    const id = await makeTeam([
      { user: collaborator, role: 'COLLABORATOR', status: 'ACTIVE' },
      { user: member3, role: 'MEMBER', status: 'PENDING' },
    ]);
    await expect(remove(id, member1)).rejects.toBeInstanceOf(BadRequestException);
    await expect(remove(id, member3)).resolves.toBeDefined();
    expect((await teams.findById(id))!.memberships).toHaveLength(4);
  });

  it('allows removal when at least three active members remain', async () => {
    const id = await makeTeam([{ user: member3, role: 'MEMBER', status: 'ACTIVE' }]);
    await expect(remove(id, member1)).resolves.toBeDefined();
    expect((await teams.findById(id))!.memberships).toHaveLength(3);
  });

  it('enforces the minimum atomically for simultaneous removals', async () => {
    const id = await makeTeam([{ user: member3, role: 'MEMBER', status: 'ACTIVE' }]);
    const results = await Promise.allSettled([remove(id, member1), remove(id, member2)]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    expect((await teams.findById(id))!.memberships).toHaveLength(3);
  });

  it('prevents conversion of a required member into a collaborator or the owner into another role', async () => {
    const id = await makeTeam();
    await expect(service.addCollaborators(id, [member1.toString()]))
      .rejects.toBeInstanceOf(BadRequestException);
    await expect(service.addMembers(id, [owner.toString()]))
      .rejects.toBeInstanceOf(BadRequestException);
    expect((await teams.findById(id))!.memberships.map((m) => m.role))
      .toEqual(['OWNER', 'MEMBER', 'MEMBER']);
  });

  it('allows member-to-collaborator conversion when three members remain', async () => {
    const id = await makeTeam([{ user: member3, role: 'MEMBER', status: 'ACTIVE' }]);
    await expect(service.addCollaborators(id, [member3.toString()])).resolves.toBeDefined();
    expect((await teams.findById(id))!.memberships.map((m) => m.role))
      .toEqual(['OWNER', 'MEMBER', 'MEMBER', 'COLLABORATOR']);
  });

  it('does not count duplicate memberships as separate people', async () => {
    const id = await makeTeam([{ user: member1, role: 'MEMBER', status: 'ACTIVE' }]);
    await expect(remove(id, member2)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('treats a legacy membership without a status as active', async () => {
    const id = await makeTeam([{ user: member3, role: 'MEMBER', status: 'ACTIVE' }]);
    await teams.collection.updateOne(
      { _id: new Types.ObjectId(id), 'memberships.user': member3 },
      { $unset: { 'memberships.$.status': '' } },
    );
    await expect(remove(id, member1)).resolves.toBeDefined();
    await expect(remove(id, member2)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects editing an undersized team without enough new active members', async () => {
    const team = await teams.create({
      teamName: `minimum-test-${new Types.ObjectId()}`,
      memberships: [
        { user: owner, role: 'OWNER', status: 'ACTIVE' },
        { user: member1, role: 'MEMBER', status: 'ACTIVE' },
      ],
    });
    createdIds.push(team._id as Types.ObjectId);
    const id = team.id as string;
    await expect(service.updateTeam(id, { summary: 'Updated' }, owner.toString(), UserRole.USER))
      .rejects.toThrow('El equipo debe tener al menos 3 integrantes activos');
    expect((await teams.findById(id))!.summary).not.toBe('Updated');
    await expect(remove(id, member1)).rejects.toBeInstanceOf(BadRequestException);
    await service.addMembers(id, [member2.toString()]);
    expect((await teams.findById(id))!.memberships).toHaveLength(3);
    await expect(service.updateTeam(id, { summary: 'Updated' }, owner.toString(), UserRole.USER))
      .resolves.toBeDefined();
  });

  it('allows an undersized team to be fixed in the same update', async () => {
    const newMember = new Types.ObjectId();
    await users.create({ _id: newMember, email: `${newMember}@example.test` });
    try {
      const team = await teams.create({
        teamName: `minimum-test-${new Types.ObjectId()}`,
        memberships: [
          { user: owner, role: 'OWNER', status: 'ACTIVE' },
          { user: member1, role: 'MEMBER', status: 'ACTIVE' },
          { user: member2, role: 'MEMBER', status: 'PENDING' },
          { user: collaborator, role: 'COLLABORATOR', status: 'ACTIVE' },
        ],
      });
      createdIds.push(team._id as Types.ObjectId);
      const id = team.id as string;
      await expect(service.updateTeam(id, { summary: 'Updated' }, owner.toString(), UserRole.USER))
        .rejects.toBeInstanceOf(BadRequestException);
      await expect(service.updateTeam(
        id, { summary: 'Updated', members: [newMember.toString()] },
        owner.toString(), UserRole.USER,
      )).resolves.toBeDefined();
      const updated = (await teams.findById(id))!;
      expect(updated.summary).toBe('Updated');
      expect(updated.memberships.find((m) => m.user.toString() === newMember.toString())?.status)
        .toBe('ACTIVE');
      expect(updated.memberships.find((m) => m.user.toString() === member2.toString())?.status)
        .toBe('PENDING');
    } finally {
      await users.deleteOne({ _id: newMember });
    }
  });

  it('does not save updates that convert a required member to a collaborator', async () => {
    const id = await makeTeam();
    await expect(service.updateTeam(
      id, { summary: 'Updated', collaborators: [member1.toString()] },
      owner.toString(), UserRole.USER,
    )).rejects.toBeInstanceOf(BadRequestException);
    expect((await teams.findById(id))!.memberships.map((m) => m.role))
      .toEqual(['OWNER', 'MEMBER', 'MEMBER']);
  });

  it('does not reintroduce a member removed concurrently with an edit', async () => {
    const id = await makeTeam([{ user: member3, role: 'MEMBER', status: 'ACTIVE' }]);
    const results = await Promise.allSettled([
      service.updateTeam(id, { summary: 'Updated' }, owner.toString(), UserRole.USER),
      remove(id, member3),
    ]);
    expect(results[1].status).toBe('fulfilled');
    const updated = (await teams.findById(id))!;
    expect(updated.memberships).toHaveLength(3);
    expect(updated.memberships.some((m) => m.user.toString() === member3.toString()))
      .toBe(false);
  });
});
