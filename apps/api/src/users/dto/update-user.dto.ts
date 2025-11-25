import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { UserRole, CareerLevel } from '@repo/types';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsNumberString()
  @Length(10, 10)
  matricula?: string;

  @IsOptional()
  @IsString()
  division?: string;

  @IsOptional()
  @IsString()
  educationalProgram?: string;

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
