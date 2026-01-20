import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Team } from '../schemas/team.schema';
import { Model } from 'mongoose';

@Injectable()
export class TeamsService {
  constructor(@InjectModel(Team.name) private teamModel: Model<Team>) {}

  async create(createTeamDto: CreateTeamDto, userId: string) {
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
  }

  async findAll({
    userId,
    isPrivate,
  }: {
    userId: string;
    isPrivate?: boolean;
  }) {
    const orConditions: any[] = [
      {
        memberships: {
          $elemMatch: {
            user: userId,
            status: 'ACTIVE',
          },
        },
      },
    ];

    if (isPrivate !== undefined) {
      orConditions.push({ isPrivate });
    }

    return this.teamModel
      .find({ $or: orConditions })
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

  async findOne(id: string): Promise<Team> {
    const team = await this.teamModel
      .findById(id)
      .populate('division')
      .populate('memberships.user')
      .exec();

    if (!team) throw new NotFoundException(`Team with ID: ${id} not found`);

    return team;
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

  async updateTeam(id: string, updateTeamDto: UpdateTeamDto) {
    try {
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

  async acceptRequest(teamId: string, userId: string) {
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

  async rejectRequest(teamId: string, userId: string) {
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

  async removeMember(teamId: string, userId: string) {
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

  async removeCollaborator(teamId: string, userId: string) {
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

  async deleteTeam(id: string): Promise<{ id: string; message: string }> {
    const deletedTeam = await this.teamModel.findByIdAndDelete(id).exec();

    if (!deletedTeam)
      throw new NotFoundException(`Team with ID: ${id} not found`);

    return { id, message: 'Team deleted successfully' };
  }
}
