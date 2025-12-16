import { mongoId } from '@/lib/utils';
import { ImpactLevel } from '@repo/types';
import { z } from 'zod';

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'El proyecto debe tener un nombre')
    .max(200, 'Excede el máximo de 200 carecteres'),
  summary: z.string().max(255, 'Excede el máximo de 255 carecteres'),
  objective: z.string().max(500, 'Excede el máximo de 500 carecteres'),
  trlRating: z.number(),
  knowledgeAreas: z.array(mongoId.or(z.literal(''))),
  impactAreas: z.array(mongoId.or(z.literal(''))),
  prioritiesPND: z.array(mongoId.or(z.literal(''))),
  sustainableObjectives: z.array(mongoId.or(z.literal(''))),
  innovationLines: z.array(mongoId.or(z.literal(''))),
  impactLevel: z.enum(ImpactLevel),
  organization: z.string().optional(),
  team: mongoId.or(z.literal('')),
  relatedProjects: z.array(mongoId.or(z.literal(''))),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});
