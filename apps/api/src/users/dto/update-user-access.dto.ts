import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@repo/types';

export class UpdateUserAccessDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  canValidateProjets?: boolean;

  @IsOptional()
  @IsBoolean()
  canCloseProject?: boolean;
}
