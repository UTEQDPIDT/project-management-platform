import { mongoId } from '@/lib/utils';
import { TeamsGrade } from '@repo/types';
import { z } from 'zod';

export const teamSchema = z.object({
  teamName: z.string().max(50, 'Excede el máximo de 255 carecteres'),
  division: mongoId.or(z.literal('')),
  summary: z.string().max(255, 'Excede el máximo de 255 carecteres').optional(),
  grade: z.enum(TeamsGrade),
  collaborators: mongoId.array(),
  members: mongoId.array(),
  isPrivate: z.boolean(),
});
