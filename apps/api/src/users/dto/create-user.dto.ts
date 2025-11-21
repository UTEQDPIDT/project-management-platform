import { IsEmail, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { UserRole } from '../../enums/user-role.enum';
import { UserType } from '../../enums/user-type.enum';

export class CreateUserDto {
  @IsString()
  givenName: string;

  @IsOptional()
  @IsString()
  familyName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsEnum(UserType)
  type: UserType;
}
