import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@repo/types';

export class UpdateUserAccessDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  canValidateElements?: boolean;

  @IsOptional()
  @IsBoolean()
  canCloseElements?: boolean;
}
