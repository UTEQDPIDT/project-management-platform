import { IsEmail, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { UserRole, UserType } from '@repo/types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'El nombre(s) del usuario.',
    example: 'Gabriela',
  })
  @IsString()
  givenName: string;

  @ApiProperty({
    description: 'El apellido(s) del usuario.',
    example: 'Suarez',
  })
  @IsOptional()
  @IsString()
  familyName: string;

  @ApiProperty({
    description: 'El correo electrónico del usuario.',
    example: 'jsuarez@uteq.edu.mx',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'La URL del avatar del usuario.',
    example: 'https://example.com/avatars/gabySuarez.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty({
    description: 'El rol del usuario.',
    example: UserRole.ADMIN,
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'El tipo de usuario.',
    example: UserType.TEACHER,
    enum: UserType,
    default: UserType.TEACHER,
  })
  @IsOptional()
  @IsEnum(UserType)
  type: UserType;

  // @IsString()
  // matricula: string;
}
