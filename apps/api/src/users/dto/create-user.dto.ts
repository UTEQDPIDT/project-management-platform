import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({
    description: 'El Rol que el usuario tiene dentro del sistema.',
    default: 'student',
    enum: ['student', 'teacher', 'admin'],
  })
  @IsEnum(['student', 'teacher', 'admin'])
  @IsOptional()
  role: string;

  @ApiProperty({
    description: 'El nombre(s) del usuario.',
    readOnly: true,
  })
  @IsString()
  givenName: string;

  @ApiProperty({
    description: 'El appellido(s) del usuario.',
    readOnly: true,
  })
  @IsString()
  @IsOptional()
  familyName: string;

  @ApiProperty({
    description: 'La dirección de correo institucional del usuario.',
    readOnly: true,
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'La URL del avatar del usuario. Brindada por Google.',
    readOnly: true,
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'La matrícula del usuario (si es estudiante).',
    maxLength: 10,
    minLength: 10,
  })
  @IsNumberString()
  @Length(10, 10)
  @IsOptional()
  matricula?: string;

  @ApiPropertyOptional({
    description: 'La división a la que pertenece el usuario.',
  })
  @IsString()
  @IsOptional()
  division?: string;

  @ApiPropertyOptional({
    description: 'El programa educativo al que pertenece el usuario.',
  })
  @IsString()
  @IsOptional()
  educationalProgram?: string;

  @ApiPropertyOptional({
    description: 'El nivel de carrera del usuario (si es estudiante).',
    default: 'licenciatura',
    enum: ['tsu', 'licenciatura', 'posgrado'],
  })
  @IsEnum(['tsu', 'licenciatura', 'posgrado'])
  @IsOptional()
  careerLevel?: string;

  @ApiPropertyOptional({
    description:
      'El número de empleado del usuario (si es docente o administartivo.)',
    maxLength: 10,
    minLength: 5,
  })
  @IsNumberString()
  @Length(5, 10)
  @IsOptional()
  employeeNumber?: string;

  @ApiPropertyOptional({
    description: 'El token de refresco hasheado del usuario.',
  })
  @IsString()
  @IsOptional()
  hashedRefreshToken?: string;
}
