import { mongoId } from '@/lib/utils';
import { TeamsGrade } from '@repo/types';
import { z } from 'zod';

export const teamSchema = (
  ownerId: string,
  requireMinimum = false,
  existingMemberIds: string[] = [ownerId],
) =>
  z.object({
    teamName: z
      .string()
      .min(1, 'El equipo debe tener un nombre')
      .max(100, 'Excede el máximo de 100 carecteres'),
    division: mongoId.or(z.literal('')),
    summary: z
      .string()
      .max(255, 'Excede el máximo de 255 carecteres')
      .optional(),
    grade: z.enum(TeamsGrade),
    collaborators: z
      .array(mongoId)
      .refine(
        (values) => !values.includes(ownerId),
        'No puedes agregarte a ti como colaborador.',
      ),
    members: z
      .array(mongoId)
      .refine(
        (values) => !values.includes(ownerId),
        'No puedes agregarte a ti como miembro.',
      )
      .refine(
        (values) =>
          !requireMinimum || new Set([...existingMemberIds, ...values]).size >= 3,
        existingMemberIds.length === 1 && existingMemberIds[0] === ownerId
          ? 'Selecciona al menos dos miembros además del líder.'
          : 'El equipo debe tener al menos 3 integrantes activos, incluido el líder.',
      ),
    isPrivate: z.boolean(),
  });
