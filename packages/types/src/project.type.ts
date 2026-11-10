import { IActivity } from './activity.type';
import { ImpactLevel } from './enums/impact-level.enum';
import { ProjectStatus } from './enums/project-status.enum';
import { ProjectValidation } from './enums/project-validation.enum';
import { SeedCategory } from './seed-category.type';
import { DevelopmentLineSubcategory } from './seed-category.type';
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
  innovationLinesSubcategories?: DevelopmentLineSubcategory[];
  organization?: string;
  impactLevel: ImpactLevel;
  owner: IUser;
  team?: ITeam;
  excludedTeamMemberships?: string[];
  program?: SeedCategory;
  isFunded?: boolean;
  relatedProjects?: IProject[];
  updatedBy?: IUser;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  status: ProjectStatus;
  validationStatus?: ProjectValidation;
  firstValidatedBy?: IUser; //redundant, correct if applicable
  ValidationBy?: IUser;
  closedBy?: IUser;
  isHidden?: boolean;
  hiddenBy?: IUser;
}
