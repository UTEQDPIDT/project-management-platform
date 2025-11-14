import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { CareerLevel } from '../../enums/career-level.enum';
import { UserRole } from '../../enums/user-role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'El Rol que el usuario tiene dentro del sistema.',
    default: UserRole.STUDENT,
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({
    description: 'La matrícula del usuario (si es estudiante).',
    maxLength: 10,
    minLength: 10,
  })
  @IsOptional()
  @IsNumberString()
  @Length(10, 10)
  matricula?: string;

  @ApiPropertyOptional({
    description: 'La división a la que pertenece el usuario.',
  })
  @IsOptional()
  @IsString()
  division?: string;

  @ApiPropertyOptional({
    description: 'El programa educativo al que pertenece el usuario.',
  })
  @IsOptional()
  @IsString()
  educationalProgram?: string;

  @ApiPropertyOptional({
    description: 'El nivel de carrera del usuario (si es estudiante).',
    default: CareerLevel.LICENCIATURA,
    enum: CareerLevel,
  })
  @IsOptional()
  @IsEnum(CareerLevel)
  careerLevel?: CareerLevel;

  @ApiPropertyOptional({
    description:
      'El número de empleado del usuario (si es docente o administartivo.)',
    maxLength: 10,
    minLength: 5,
  })
  @IsOptional()
  @IsNumberString()
  @Length(5, 10)
  employeeNumber?: string;

  @ApiPropertyOptional({
    description: 'El token de refresco hasheado del usuario.',
  })
  @IsOptional()
  @IsString()
  hashedRefreshToken?: string;
}
