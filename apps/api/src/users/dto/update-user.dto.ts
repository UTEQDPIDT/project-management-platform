import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ObjectId } from 'mongoose';
import { UserRole, CareerLevel, Sex, State, UserType } from '@repo/types';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsBoolean()
  canValidateProjets?: boolean;

  @IsOptional()
  @IsBoolean()
  canCloseProject?: boolean;

  @IsOptional()
  @IsEnum(UserType)
  type: UserType;

  @IsEnum(Sex)
  sex: Sex;

  @IsEnum(State)
  state: State;

  @IsDate()
  dateOfBirth: Date;

  @IsOptional()
  @IsNumberString()
  @Length(10, 10)
  matricula?: string;

  @IsOptional()
  @IsMongoId()
  division?: ObjectId;

  @IsOptional()
  @IsMongoId()
  educationalProgram?: ObjectId;

  @IsOptional()
  @IsEnum(CareerLevel)
  careerLevel?: CareerLevel;

  @IsOptional()
  @IsNumberString()
  @Length(5, 10)
  employeeNumber?: string;

  @IsOptional()
  @IsString()
  hashedRefreshToken?: string;
}
