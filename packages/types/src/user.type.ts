import { UserRole } from './enums/user-role.enum';
import { CareerLevel } from './enums/career-level.enum';
import { UserType } from './enums/user-type.enum';
import { Sex } from './enums/sex-enum';
import { ResearcherType } from './enums/researcher-type.enum';
import { EducationLevel } from './enums/education-level.enum';
import { SniiLevel } from './enums/snii-level.enum';
import { SeedCategory } from './seed-category.type';

export interface IUser {
  _id: string;
  role: UserRole;
  canValidateElements: boolean;
  canCloseElements: boolean;
  type: UserType;
  givenName: string;
  familyName: string;
  email: string;
  avatarUrl?: string;
  sex?: Sex | null;
  hasDisability?: boolean | null;
  speaksIndigenousLanguage?: boolean | null;
  researcherType?: ResearcherType | null;
  educationLevel?: EducationLevel | null;
  sniiLevel?: SniiLevel | null;
  dateOfBirth: Date;
  division?: SeedCategory;
  educationalProgram?: SeedCategory;
  careerLevel?: CareerLevel;
  hashedRefreshToken?: string | null;
  createdAt: string;
  updatedAt: string;
}
