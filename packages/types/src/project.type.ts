import { IActivity } from './activity.type';
import { ImpactLevel } from './enums/impact-level.enum';
import { Status } from './enums/status.enum';
import { IFile } from './file.type';
import { IProduct } from './product.type';
import { SeedCategory } from './seed-category.type';
import { ITeam } from './team.type';
import { IUser } from './user.type';

export interface IProject {
  _id: string;
  name: string;
  summary: string;
  objective: string;
  trlRating: number;
  status: Status;
  progress: number;
  category: string;
  knowledgeAreas: SeedCategory;
  impactAreas: SeedCategory;
  prioritiesPND: SeedCategory;
  sustainableObjectives: SeedCategory;
  innovationLines: SeedCategory;
  organization: string;
  impactLevel: ImpactLevel;
  owner: IUser;
  team: ITeam;
  relatedProject: IProject[];
  activities: IActivity[];
  product: IProduct[];
  files: IFile[];
  updatedBy: IUser;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
