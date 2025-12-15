import { UserRole } from './enums/user-role.enum';
import { CareerLevel } from './enums/career-level.enum';
import { UserType } from './enums/user-type.enum';
import { Sex } from './enums/sex-enum';
import { State } from './enums/state.enum';
import { SeedCategory } from './seed-category.type';

export interface IUser {
  _id: string;
  role: UserRole;
  type: UserType;
  givenName: string;
  familyName: string;
  email: string;
  avatarUrl?: string;
  sex: Sex;
  state: State;
  dateOfBirth: Date;
  matricula?: string;
  division?: SeedCategory;
  educationalProgram?: SeedCategory;
  careerLevel?: CareerLevel;
  employeeNumber?: string;
  hashedRefreshToken?: string | null;
  createdAt: string;
  updatedAt: string;
}
