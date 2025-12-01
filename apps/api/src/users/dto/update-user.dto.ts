import {
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { UserRole, CareerLevel, Gender, State } from '@repo/types';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @IsEnum(Gender)
  gender: Gender;

  @IsEnum(State)
  state: State;

  @Min(17)
  @Max(100)
  @IsInt()
  age: number;

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
