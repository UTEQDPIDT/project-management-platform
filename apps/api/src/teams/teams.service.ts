import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Team } from '../schemas/team.schema';
import { Model } from 'mongoose';
import { UserRole } from '@repo/types';
import { AccessDeniedException } from '../common/security/access-denied.exception';
import { AccessDeniedReason } from '../common/security/access-denied-reason.enum';

@Injectable()
export class TeamsService {
  constructor(@InjectModel(Team.name) private teamModel: Model<Team>) {}

  private isActiveMember(team: Team, userId: string): boolean {
    return team.memberships.some(
      (membership) =>
        membership.user.toString() === userId && membership.status === 'ACTIVE',
    );
  }

  private isOwner(team: Team, userId: string): boolean {
    return team.memberships.some(
      (membership) =>
        membership.user.toString() === userId &&
        membership.role === 'OWNER' &&
        membership.status === 'ACTIVE',
    );
  }

  private async ensureCanManageTeam(
    teamId: string,
    actorId: string,
    actorRole: UserRole,
  ): Promise<Team> {
    const team = await this.teamModel.findById(teamId).select('memberships isPrivate');

    if (!team) {
      throw new NotFoundException(`Team with ID: ${teamId} not found`);
    }

    if (actorRole === UserRole.ADMIN || this.isOwner(team, actorId)) {
      return team;
    }

    throw new AccessDeniedException({
      reason: AccessDeniedReason.TEAM_MANAGE_FORBIDDEN,
      message: 'Only team owners or admin users can manage this team.',
      resourceType: 'team',
      resourceId: teamId,
      actorId,
      actorRole,
    });
  }

  private async ensureCanViewTeam(
    teamId: string,
    actorId: string,
    actorRole: UserRole,
  ): Promise<Team> {
    const team = await this.teamModel
      .findById(teamId)
      .populate('division')
      .populate('memberships.user')
      .exec();

    if (!team) {
      throw new NotFoundException(`Team with ID: ${teamId} not found`);
    }

    if (
      actorRole === UserRole.ADMIN ||
      !team.isPrivate ||
      this.isActiveMember(team, actorId)
    ) {
      return team;
    }

    throw new AccessDeniedException({
      reason: AccessDeniedReason.TEAM_VIEW_FORBIDDEN,
      message: 'You are not allowed to view this team.',
      resourceType: 'team',
      resourceId: teamId,
      actorId,
      actorRole,
    });
  }

  async create(createTeamDto: CreateTeamDto, userId: string) {
    try {
      // Build memberships array
      const memberships = [
        {
          user: userId,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      ];

      if (Array.isArray(createTeamDto.members)) {
        memberships.push(
          ...createTeamDto.members.map((id: string) => ({
            user: id,
            role: 'MEMBER',
            status: 'ACTIVE',
          })),
        );
      }

      if (Array.isArray(createTeamDto.collaborators)) {
        memberships.push(
          ...createTeamDto.collaborators.map((id: string) => ({
            user: id,
            role: 'COLLABORATOR',
            status: 'ACTIVE',
          })),
        );
      }

      const teamData = {
        ...createTeamDto,
        memberships,
      };

      // Remove members/collaborators from top-level dto before saving
      delete teamData.members;
      delete teamData.collaborators;

      const createdTeam = await this.teamModel.create(teamData);

      return {
        id: createdTeam._id.toString(),
        message: 'Team created successfully',
      };
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new BadRequestException('Team with this name already exists');
      }
      throw new BadRequestException(err?.message || 'Failed to create team');
    }
  }

  async findAll({
    userId,
    userRole,
    isPrivate,
  }: {
    userId?: string;
    userRole?: UserRole;
    isPrivate?: boolean;
  }) {
    if (!userId) {
      return [];
    }

    let filter: Record<string, unknown>;

    if (userRole === UserRole.ADMIN) {
      filter = isPrivate === undefined ? {} : { isPrivate };
    } else if (isPrivate === true) {
      filter = {
        memberships: {
          $elemMatch: {
            user: userId,
            status: 'ACTIVE',
          },
        },
      };
    } else if (isPrivate === false) {
      filter = { isPrivate: false };
    } else {
      filter = {
        $or: [
          { isPrivate: false },
          {
            memberships: {
              $elemMatch: {
                user: userId,
                status: 'ACTIVE',
              },
            },
          },
        ],
      };
    }

    return this.teamModel
      .find(filter)
      .populate('memberships.user')
      .populate('division')
      .exec();
  }

  async findByUser(userId: string) {
    return this.teamModel
      .find({
        memberships: {
          $elemMatch: {
            user: userId,
            status: 'ACTIVE',
          },
        },
      })
      .populate('memberships.user')
      .populate('division')
      .exec();
  }

  async findOne(id: string, actorId: string, actorRole: UserRole): Promise<Team> {
    return this.ensureCanViewTeam(id, actorId, actorRole);
  }

  async findOwnedByUser(userId: string): Promise<Team[]> {
    return this.teamModel
      .find({
        memberships: {
          $elemMatch: {
            user: userId,
            role: 'OWNER',
            status: 'ACTIVE',
          },
        },
      })
      .populate('division')
      .populate('memberships.user')
      .exec();
  }

  async updateTeam(
    id: string,
    updateTeamDto: UpdateTeamDto,
    userId: string,
    userRole: string,
  ) {
    try {
      const existingTeam = await this.teamModel.findById(id).select('memberships');

      if (!existingTeam) {
        throw new NotFoundException(`Team with ID: ${id} not found`);
      }

      const isOwner = existingTeam.memberships.some(
        (membership) =>
          membership.user.toString() === userId &&
          membership.role === 'OWNER' &&
          membership.status === 'ACTIVE',
      );

      const isAdmin = userRole === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        throw new ForbiddenException('Only team owners or admin users can edit this team.');
      }

      const updatedTeam = await this.teamModel
        .findByIdAndUpdate(id, updateTeamDto, { new: true })
        .exec();

      if (!updatedTeam) {
        throw new NotFoundException(`Team with ID: ${id} not found`);
      }

      await this.addMembers(id, updateTeamDto.members || []);
      await this.addCollaborators(id, updateTeamDto.collaborators || []);

      return updatedTeam;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new BadRequestException('Team with this name already exists');
      }
      throw new BadRequestException(err.message);
    }
  }

  async addCollaborators(teamId: string, userIds: string[]) {
    const team = await this.teamModel.findById(teamId);
    if (!team) throw new NotFoundException();

    const existingUserIds = team.memberships.map((m) => m.user.toString());

    const newMemberships = userIds
      .filter((id) => !existingUserIds.includes(id))
      .map((id) => ({
        user: id,
        role: 'COLLABORATOR',
        status: 'ACTIVE',
      }));

    await this.teamModel.findByIdAndUpdate(teamId, {
      $push: { memberships: { $each: newMemberships } },
    });

    return { id: teamId, message: 'Collaborators added successfully' };
  }

  async addCollaboratorsAsActor(
    teamId: string,
    userIds: string[],
    actorId: string,
    actorRole: UserRole,
  ) {
    await this.ensureCanManageTeam(teamId, actorId, actorRole);

    return this.addCollaborators(teamId, userIds);
  }

  async addMembers(teamId: string, userIds: string[]) {
    const team = await this.teamModel.findById(teamId);
    if (!team) throw new NotFoundException();

    const existingUserIds = team.memberships.map((m) => m.user.toString());

    const newMemberships = userIds
      .filter((id) => !existingUserIds.includes(id))
      .map((id) => ({
        user: id,
        role: 'MEMBER',
        status: 'ACTIVE',
      }));

    await this.teamModel.findByIdAndUpdate(teamId, {
      $push: { memberships: { $each: newMemberships } },
    });

    return { id: teamId, message: 'Members added successfully' };
  }

  async addMembersAsActor(
    teamId: string,
    userIds: string[],
    actorId: string,
    actorRole: UserRole,
  ) {
    await this.ensureCanManageTeam(teamId, actorId, actorRole);

    return this.addMembers(teamId, userIds);
  }

  async sendTeamRequest(teamId: string, userId: string) {
    const team = await this.teamModel.findById(teamId);
    if (!team) throw new NotFoundException();

    const alreadyExists = team.memberships.some(
      (m) => m.user.toString() === userId,
    );

    if (alreadyExists) {
      throw new BadRequestException('User already related to team');
    }

    await this.teamModel.findByIdAndUpdate(teamId, {
      $push: {
        memberships: {
          user: userId,
          role: 'MEMBER',
          status: 'PENDING',
        },
      },
    });

    return { id: teamId, message: 'Team request sent successfully' };
  }

  async acceptRequest(
    teamId: string,
    userId: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    await this.ensureCanManageTeam(teamId, actorId, actorRole);

    const result = await this.teamModel.findOneAndUpdate(
      {
        _id: teamId,
        memberships: {
          $elemMatch: {
            user: userId,
            status: 'PENDING',
          },
        },
      },
      {
        $set: {
          'memberships.$.status': 'ACTIVE',
        },
      },
    );

    if (!result) {
      throw new NotFoundException('Pending request not found');
    }

    return { id: teamId, message: 'Team request accepted successfully' };
  }

  async rejectRequest(
    teamId: string,
    userId: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    await this.ensureCanManageTeam(teamId, actorId, actorRole);

    await this.teamModel.findByIdAndUpdate(teamId, {
      $pull: {
        memberships: {
          user: userId,
          status: 'PENDING',
        },
      },
    });

    return { id: teamId, message: 'Team request rejected successfully' };
  }

  async removeMember(
    teamId: string,
    userId: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    await this.ensureCanManageTeam(teamId, actorId, actorRole);

    await this.teamModel.findByIdAndUpdate(teamId, {
      $pull: {
        memberships: {
          user: userId,
          role: 'MEMBER',
        },
      },
    });

    return { id: teamId, message: 'Member removed successfully' };
  }

  async removeCollaborator(
    teamId: string,
    userId: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    await this.ensureCanManageTeam(teamId, actorId, actorRole);

    await this.teamModel.findByIdAndUpdate(teamId, {
      $pull: {
        memberships: {
          user: userId,
          role: 'COLLABORATOR',
        },
      },
    });

    return { id: teamId, message: 'Collaborator removed successfully' };
  }

  async deleteTeam(
    id: string,
    actorId: string,
    actorRole: UserRole,
  ): Promise<{ id: string; message: string }> {
    await this.ensureCanManageTeam(id, actorId, actorRole);

    const deletedTeam = await this.teamModel.findByIdAndDelete(id).exec();

    if (!deletedTeam)
      throw new NotFoundException(`Team with ID: ${id} not found`);

    return { id, message: 'Team deleted successfully' };
  }
}
