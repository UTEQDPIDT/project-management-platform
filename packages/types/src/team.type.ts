import { SeedCategory } from './seed-category.type';
import { TeamsGrade } from './enums/teams-grade.enum';
import { IUser } from './user.type';

export enum TeamMembershipRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER',
  COLLABORATOR = 'COLLABORATOR',
}

export enum TeamMembershipStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

export interface ITeamMembership {
  user: IUser;
  role: TeamMembershipRole;
  status: TeamMembershipStatus;
  requestedAt?: Date;
  approvedAt?: Date;
}

export interface ITeam {
  _id: string;
  teamName: string;
  summary?: string;
  division?: SeedCategory;
  grade: TeamsGrade;
  memberships: ITeamMembership[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}
