import {
  IsEnum,
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { UserRole, CareerLevel } from '@repo/types';
import { ObjectId } from 'mongoose';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

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
