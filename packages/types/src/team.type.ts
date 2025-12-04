import { TeamsGrade } from './enums/teams-grade.enum';
import { IUser } from './user.type';

export interface ITeam {
  _id: string;
  teamName: string;
  summary: string;
  grade: TeamsGrade;
  owner: string | IUser;
  collaborators: string[] | IUser[];
  members: string[] | IUser[];
  userRequests: IUser[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}
