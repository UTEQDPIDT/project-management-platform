import { mongoId } from '@/lib/utils';
import { EventType } from '@repo/types';
import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().min(1, 'El evento debe tener un nombre.'),
  summary: z
    .string()
    .min(1, 'El proyecto debe tener una descripción.')
    .max(500, 'Excede el máximo de 500 carecteres.'),
  startDate: z.date('El evento necesita una fecha de inicio.'),
  endDate: z.date().optional(),
  organization: z.string().optional(),
  location: z.string().min(1, 'El evento debe tener una ubicación.'),
  type: z.enum(EventType),
  isPrivate: z.boolean(),
  acceptsProducts: z.boolean(),
  participants: z.array(mongoId),
});
