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

  async create(
    createTeamDto: CreateTeamDto,
    userId: string,
  ): Promise<{ id: string; message: string }> {
    try {
      const createdTeam = await this.teamModel.create({
        ...createTeamDto,
        owner: userId,
      });
      return {
        id: createdTeam._id.toString(),
        message: 'Team created successfully',
      };
    } catch (err: any) {
      console.error('Error creating team:', err);
      throw new BadRequestException('Error al crear el equipo.');
    }
  }

  async findAll(filter: {
    userId: string;
    isPrivate?: boolean;
  }): Promise<Team[]> {
    const { userId, isPrivate } = filter;

    let query: any = {};

    if (filter.isPrivate !== undefined) {
      query = {
        $or: [
          { isPrivate: isPrivate },
          { owner: userId },
          { members: userId },
          { collaborators: userId },
        ],
      };
    }

    return this.teamModel
      .find(query)
      .populate('owner')
      .populate('members')
      .populate('collaborators')
      .populate('division')
      .populate('userRequests')
      .exec();
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamModel
      .findById(id)
      .populate('owner')
      .populate('members')
      .populate('collaborators')
      .populate('division')
      .populate('userRequests')
      .exec();
    if (!team) throw new NotFoundException(`Team with ID: ${id} not found`);
    return team;
  }

  async findByOwner(ownerId: string): Promise<Team | null> {
    const team = await this.teamModel
      .findOne({ owner: ownerId })
      .populate('owner')
      .populate('members')
      .populate('collaborators')
      .populate('division')
      .populate('userRequests')
      .exec();
    return team || null;
  }

  async findByUser(userId: string) {
    return await this.teamModel
      .find({
        $or: [{ owner: userId }, { members: userId }],
      })
      .populate('owner')
      .populate('members')
      .populate('collaborators')
      .populate('division')
      .populate('userRequests')
      .exec();
  }

  async updateTeam(id: string, updateTeamDto: UpdateTeamDto) {
    try {
      const updatedTeam = await this.teamModel
        .findByIdAndUpdate(id, updateTeamDto, { new: true })
        .exec();

      if (!updatedTeam)
        throw new NotFoundException(`Team with ID: ${id} not found`);
      return { id, message: 'Team updated successfully' };
    } catch (err: any) {
      if (err.code === 11000) {
        throw new BadRequestException('Team with this name already exists');
      }
      throw new BadRequestException(err.message);
    }
  }

  async addCollaborators(
    teamId: string,
    userIds: string[],
  ): Promise<{ id: string; message: string }> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) throw new NotFoundException(`Team with ID: ${teamId} not found`);

    if (!Array.isArray(userIds) || userIds.length === 0)
      throw new BadRequestException('userIds must be a non-empty array');

    // Convert collaborators to string IDs (populated or raw ObjectId)
    const existingIds = team.collaborators.map((c: any) =>
      c._id ? c._id.toString() : c.toString(),
    );

    // Filter IDs that are not already in the team
    const newIds = userIds.filter((id) => !existingIds.includes(id));

    if (newIds.length === 0)
      throw new BadRequestException('All users are already collaborators');

    await this.teamModel.findByIdAndUpdate(teamId, {
      $addToSet: { collaborators: { $each: newIds } },
    });

    return { id: teamId, message: 'Collaborators added successfully' };
  }

  async addMembers(
    teamId: string,
    userIds: string[],
  ): Promise<{ id: string; message: string }> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) throw new NotFoundException(`Team with ID: ${teamId} not found`);

    if (!Array.isArray(userIds) || userIds.length === 0)
      throw new BadRequestException('userIds must be a non-empty array');

    const existingIds = team.members.map((m: any) =>
      m._id ? m._id.toString() : m.toString(),
    );

    const newIds = userIds.filter((id) => !existingIds.includes(id));

    if (newIds.length === 0)
      throw new BadRequestException('All users are already members');

    await this.teamModel.findByIdAndUpdate(teamId, {
      $addToSet: { members: { $each: newIds } },
    });

    return { id: teamId, message: 'Members added successfully' };
  }

  async sendTeamRequest(
    teamId: string,
    userId: string,
  ): Promise<{ id: string; message: string }> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) throw new NotFoundException(`Team with ID: ${teamId} not found`);

    const existingRequests = team.userRequests.map((r: any) =>
      r._id ? r._id.toString() : r.toString(),
    );

    if (existingRequests.includes(userId))
      throw new BadRequestException(
        `Request already exists for user ${userId}`,
      );

    await this.teamModel.findByIdAndUpdate(teamId, {
      $addToSet: { userRequests: userId },
    });

    return { id: teamId, message: 'Team request sent successfully' };
  }

  async acceptRequest(
    teamId: string,
    userId: string,
  ): Promise<{ id: string; message: string }> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) throw new NotFoundException(`Team with ID: ${teamId} not found`);

    await this.teamModel.findByIdAndUpdate(teamId, {
      $pull: { userRequests: userId },
      $addToSet: { members: userId },
    });

    return { id: teamId, message: 'Team request accepted successfully' };
  }

  async rejectRequest(
    teamId: string,
    userId: string,
  ): Promise<{ id: string; message: string }> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) throw new NotFoundException(`Team with ID: ${teamId} not found`);

    await this.teamModel.findByIdAndUpdate(teamId, {
      $pull: { userRequests: userId },
    });

    return { id: teamId, message: 'Team request rejected successfully' };
  }

  async removeCollaborator(
    teamId: string,
    userId: string,
  ): Promise<{ id: string; message: string }> {
    await this.teamModel.findByIdAndUpdate(teamId, {
      $pull: { collaborators: userId },
    });

    return { id: teamId, message: 'Collaborator removed successfully' };
  }

  async removeMember(
    teamId: string,
    userId: string,
  ): Promise<{ id: string; message: string }> {
    await this.teamModel.findByIdAndUpdate(teamId, {
      $pull: { members: userId },
    });

    return { id: teamId, message: 'Member removed successfully' };
  }

  async deleteTeam(id: string): Promise<{ id: string; message: string }> {
    const deletedTeam = await this.teamModel.findByIdAndDelete(id).exec();

    if (!deletedTeam)
      throw new NotFoundException(`Team with ID: ${id} not found`);

    return { id, message: 'Team deleted successfully' };
  }
}
