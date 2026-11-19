import { BadRequestException } from '@nestjs/common';
import { UserType } from '@repo/types';

export function userTypeFromEmail(email: string): UserType {
  const firstCharacter = email.trim().charAt(0);
  if (/^[a-z]$/i.test(firstCharacter)) return UserType.MAESTRO;
  if (/^[0-9]$/.test(firstCharacter)) return UserType.ESTUDIANTE;
  throw new BadRequestException(
    'El correo debe comenzar con una letra o un número para asignar el tipo de usuario.',
  );
}
