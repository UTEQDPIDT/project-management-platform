import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Team } from '../schemas/team.schema';
import { Model, ObjectId, Types } from 'mongoose';

@Injectable()
export class TeamsService {

  constructor(@InjectModel(Team.name) private teamModel: Model<Team>) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    try{
      const createdTeam = new this.teamModel(createTeamDto);
      return await createdTeam.save();
    } catch (err: any) {
      console.error('Error creating team:', err);
      throw new BadRequestException('Error al crear el equipo.');
    }
  }

  async findAll(): Promise<Team[]> {
    return this.teamModel.find().exec();
  }

  async findOne(id: string): Promise<Team> { 
    const team = await this.teamModel.findById(id).exec();
    if (!team) throw new NotFoundException(`Team with ID: ${id} not found`);
    return team;
  }

  async findByOwner(ownerId: string): Promise<Team | null> {
    const team = await this.teamModel.findOne({ owner: ownerId }).exec();
    return team || null;
  }

  async updateTeam(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    try {
      const updatedTeam = await this.teamModel
        .findByIdAndUpdate(id, updateTeamDto, { new: true })
        .exec();

      if (!updatedTeam)
        throw new NotFoundException(`Team with ID: ${id} not found`);
      return updatedTeam;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new BadRequestException(
          'Team with this name already exists',
        );
      }
      throw new BadRequestException(err.message);
    }
  }

async addCollaborator(teamId: string, userId: string): Promise<Team> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team)
      throw new NotFoundException(`Team with ID: ${teamId} not found`);

    const isAlreadyCollaborator = team.collaborators.some(
      (collaboratorId: Types.ObjectId) => collaboratorId.equals(userId)
    );

    if (isAlreadyCollaborator) {
      throw new BadRequestException(`User ID: ${userId} is already a collaborator in Team ID: ${teamId}`);
    }
    
    const updatedTeam = await this.teamModel.findByIdAndUpdate(
      teamId,
      { $addToSet: { collaborators: userId } },
      { new: true },
    );
    
    return updatedTeam;
  }

async addMember(teamId: string, userId: string): Promise<Team> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team)
      throw new NotFoundException(`Team with ID: ${teamId} not found`);

    const isAlreadyMember = team.members.some(
      (memberId: Types.ObjectId) => memberId.equals(userId)
    );

    if (isAlreadyMember) {
      throw new BadRequestException(`User ID: ${userId} is already a member in Team ID: ${teamId}`);
    }
    
    const updatedTeam = await this.teamModel.findByIdAndUpdate(
      teamId,
      { $addToSet: { members: userId } },
      { new: true },
    );
    
    return updatedTeam;
  }

async sendTeamRequest(teamId: string, userId: string): Promise<Team> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team)
      throw new NotFoundException(`Team with ID: ${teamId} not found`);

    const requestExists = team.userRequests.some(
      (requestId: Types.ObjectId) => requestId.equals(userId)
    );

    if (requestExists) {
      throw new BadRequestException(`Request from User ID: ${userId} already exists for Team ID: ${teamId}`);
    }
    

    const updatedTeam = await this.teamModel.findByIdAndUpdate(
      teamId,
      { $addToSet: { requests: userId } },
      { new: true },
    );
    
    return updatedTeam;
  }

async acceptRequest(teamId: string, userId: string): Promise<Team> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team)
      throw new NotFoundException(`Team with ID: ${teamId} not found`);

    const requestExists = team.userRequests.some(
      (requestId: Types.ObjectId) => requestId.equals(userId)
    );

    if (!requestExists) {
      throw new NotFoundException(`Request from User ID: ${userId} not found in Team ID: ${teamId}`);
    }

    const updatedTeam = await this.teamModel.findByIdAndUpdate(
        teamId,
        {
            $pull: { userRequests: userId }, // Eliminar de solicitudes
            $addToSet: { members: userId }, // Agregar a miembros
        },
        { new: true },
    ).exec();
        
    return updatedTeam;
  }

async removeCollaborator(teamId: string, userId: string): Promise<Team> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team)
      throw new NotFoundException(`Team with ID: ${teamId} not found`);

    const collaboratorExists = team.collaborators.some(
      (collaboratorId: Types.ObjectId) => collaboratorId.equals(userId)
    );

    if (!collaboratorExists) {
      throw new NotFoundException(`Collaborator User ID: ${userId} not found in Team ID: ${teamId}`);
    }

    const updatedTeam = await this.teamModel.findByIdAndUpdate(
      teamId,
      { $pull: { collaborators: userId } },
      { new: true },
    );
    
    return updatedTeam;
  }

async removeMember(teamId: string, userId: string): Promise<Team> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team)
      throw new NotFoundException(`Team with ID: ${teamId} not found`);

    const memberExists = team.members.some(
      (memberId: Types.ObjectId) => memberId.equals(userId)
    );

    if (!memberExists) {
      throw new NotFoundException(`Member User ID: ${userId} not found in Team ID: ${teamId}`);
    }

    const updatedTeam = await this.teamModel.findByIdAndUpdate(
      teamId,
      { $pull: { members: userId } },
      { new: true },
    );

    return updatedTeam;
  }

async removeRequest(teamId: string, userId: string): Promise<Team> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team)
        throw new NotFoundException(`Team with ID: ${teamId} not found`);

    const requestExists = team.userRequests.some(
        (requestId: Types.ObjectId) => requestId.equals(userId)
    );

    if (!requestExists) {
        throw new NotFoundException(`Request from User ID: ${userId} not found in Team ID: ${teamId}`);
    }

    const updatedTeam = await this.teamModel.findByIdAndUpdate(
        teamId,
        { $pull: { userRequests: userId } },
        { new: true },
    );
    
    return updatedTeam;
  }

  async deleteTeam(id: string): Promise<Team> {
      const deletedTeam = await this.teamModel.findByIdAndDelete(id).exec();

      if (!deletedTeam)
          throw new NotFoundException(`Team with ID: ${id} not found`);
        
      return deletedTeam;
  }
}