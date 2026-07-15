import { IActivity } from './activity.type';
import { ImpactLevel } from './enums/impact-level.enum';
import { ProjectStatus } from './enums/project-status.enum';
import { SeedCategory } from './seed-category.type';
import { ITeam } from './team.type';
import { IUser } from './user.type';

export interface IProject {
  _id: string;
  name: string;
  objective: string;
  trlRating?: number;
  knowledgeAreas?: SeedCategory[];
  impactAreas?: SeedCategory[];
  prioritiesPND?: SeedCategory[];
  sustainableObjectives?: SeedCategory[];
  innovationLines?: SeedCategory[];
  organization?: string;
  impactLevel: ImpactLevel;
  owner: IUser;
  team?: ITeam;
  program?: SeedCategory;
  isFunded?: boolean;
  relatedProjects?: IProject[];
  updatedBy?: IUser;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  status: ProjectStatus;
  firstValidatedBy?: IUser;
  ValidationBy?: IUser;
  closedBy?: IUser;
}
