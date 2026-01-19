import { SeedCategory } from './seed-category.type';
import { TeamsGrade } from './enums/teams-grade.enum';
import { IUser } from './user.type';

export interface ITeamMembership {
  user: IUser;
  role: 'OWNER' | 'MEMBER' | 'COLLABORATOR';
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
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
