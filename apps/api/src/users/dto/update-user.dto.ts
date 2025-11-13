import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Exclude read-only fields
  @IsOptional()
  readonly email?: never;

  @IsOptional()
  readonly avatarUrl?: never;

  @IsOptional()
  readonly givenName?: never;

  @IsOptional()
  readonly familyName?: never;
}
