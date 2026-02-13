import { mongoId } from '@/lib/utils';
import { TeamsGrade } from '@repo/types';
import { z } from 'zod';

export const teamSchema = (ownerEmail: string) =>
  z.object({
    teamName: z
      .string()
      .min(1, 'El equipo debe tener un nombre')
      .max(50, 'Excede el máximo de 50 carecteres'),
    division: mongoId.or(z.literal('')),
    summary: z
      .string()
      .max(255, 'Excede el máximo de 255 carecteres')
      .optional(),
    grade: z.enum(TeamsGrade),
    collaborators: z
      .array(mongoId)
      .refine(
        (values) => !values.includes(ownerEmail),
        'No puedes agregarte a ti como colaborador.',
      ),
    members: z
      .array(mongoId)
      .refine(
        (values) => !values.includes(ownerEmail),
        'No puedes agregarte a ti como miembro.',
      ),
    isPrivate: z.boolean(),
  });
