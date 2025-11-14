import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { UserRole } from '../../enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'El nombre(s) del usuario.',
  })
  @IsString()
  givenName: string;

  @ApiProperty({
    description: 'El appellido(s) del usuario.',
  })
  @IsOptional()
  @IsString()
  familyName: string;

  @ApiProperty({
    description: 'La dirección de correo institucional del usuario.',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'La URL del avatar del usuario. Brindada por Google.',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'El Rol que el usuario tiene dentro del sistema.',
    default: UserRole.STUDENT,
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;
}
