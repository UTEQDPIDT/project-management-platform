import { mongoId } from '@/lib/utils';
import { ImpactLevel } from '@repo/types';
import { z } from 'zod';

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'El proyecto debe tener un nombre')
    .max(200, 'Excede el máximo de 200 carecteres'),
  objective: z
    .string()
    .min(1, 'El proyecto debe tener un objetivo')
    .max(500, 'Excede el máximo de 500 carecteres'),
  trlRating: z.number().min(0, 'El Nivel de TRL no puede ser 0'),
  knowledgeAreas: z.array(mongoId),
  impactAreas: z.array(mongoId),
  prioritiesPND: z.array(mongoId),
  sustainableObjectives: z.array(mongoId),
  innovationLines: z.array(mongoId),
  impactLevel: z.enum(ImpactLevel),
  organization: z.string().optional(),
  team: mongoId.or(z.literal('')),
  relatedProjects: z.array(mongoId),
  startDate: z.date('La fecha de inicio es requerida').optional(),
  endDate: z.date('La fecha de fin es requerida').optional(),
});
