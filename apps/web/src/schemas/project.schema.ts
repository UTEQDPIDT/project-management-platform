import { mongoId } from '@/lib/utils';
import { ImpactLevel } from '@repo/types';
import { z } from 'zod';

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'El proyecto debe tener un nombre')
    .max(200, 'Excede el máximo de 200 carecteres'),
  objective: z
    .string()
    .min(1, 'El proyecto debe tener un objetivo')
    .max(500, 'Excede el máximo de 500 carecteres'),
  trlRating: z.number(),
  knowledgeAreas: z.array(mongoId),
  impactAreas: z.array(mongoId),
  prioritiesPND: z.array(mongoId),
  sustainableObjectives: z.array(mongoId),
  innovationLines: z.array(mongoId),
  impactLevel: z.enum(ImpactLevel),
  organization: z.string().optional(),
  activities: z
    .array(
      z.object({
        name: z.string(),
      }),
    )
    .min(5, 'El proyecto debe tener un mínimo de 5 actividades.'),
  team: mongoId.or(z.literal('')),
  relatedProjects: z.array(mongoId),
  startDate: z.date(),
  endDate: z.date(),
});
