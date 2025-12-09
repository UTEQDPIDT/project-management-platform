import { Division } from './division.type';
import { TeamsGrade } from './enums/teams-grade.enum';
import { IUser } from './user.type';

export interface ITeam {
  _id: string;
  teamName: string;
  summary?: string;
  division?: Division;
  grade: TeamsGrade;
  owner: string | IUser;
  collaborators: string[] | IUser[];
  members: string[] | IUser[];
  userRequests: string[] | IUser[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}
