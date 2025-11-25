import { UserRole } from './enums/user-role.enum';
import { CareerLevel } from './enums/career-level.enum';
import { UserType } from './enums/user-type.enum';

export interface User {
  _id: string; // Mongoose always returns _id
  role: UserRole;
  type: UserType;

  givenName: string;
  familyName: string;
  email: string;

  avatarUrl?: string;

  matricula?: string;
  division?: string;
  educationalProgram?: string;

  careerLevel?: CareerLevel;

  employeeNumber?: string;

  hashedRefreshToken?: string | null;

  createdAt: string; // timestamps: true
  updatedAt: string;
}
