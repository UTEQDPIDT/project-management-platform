import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ObjectId } from 'mongoose';
import { CareerLevel, Sex, State, UserType } from '@repo/types';

export class UpdateUserDto {

  @IsOptional()
  @IsString()
  @Length(2, 40)
  givenName: string;

  @IsOptional()
  @IsString()
  @Length(2, 40)
  familyName: string;

  @IsOptional()
  @IsEnum(UserType)
  type: UserType;

  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @IsOptional()
  @IsEnum(State)
  state?: State;

  @IsOptional()
  @IsDate()
  dateOfBirth?: Date;

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

}
