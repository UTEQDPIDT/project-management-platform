import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongoose';
import {
  CareerLevel,
  EducationLevel,
  ResearcherType,
  Sex,
  SniiLevel,
  UserType,
} from '@repo/types';

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
  sex?: Sex | null;

  @IsOptional()
  @IsBoolean()
  hasDisability?: boolean | null;

  @IsOptional()
  @IsBoolean()
  speaksIndigenousLanguage?: boolean | null;

  @IsOptional()
  @IsEnum(ResearcherType)
  researcherType?: ResearcherType | null;

  @IsOptional()
  @IsEnum(EducationLevel)
  educationLevel?: EducationLevel | null;

  @IsOptional()
  @IsEnum(SniiLevel)
  sniiLevel?: SniiLevel | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @IsOptional()
  @IsMongoId()
  division?: ObjectId;

  @IsOptional()
  @IsMongoId()
  educationalProgram?: ObjectId;

  @IsOptional()
  @IsEnum(CareerLevel)
  careerLevel?: CareerLevel;

}
