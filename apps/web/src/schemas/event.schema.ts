import { mongoId } from '@/lib/utils';
import { EventType } from '@repo/types';
import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().min(1, 'El evento debe tener un nombre.'),
  summary: z
    .string()
    .min(1, 'El proyecto debe tener una descripción.')
    .max(500, 'Excede el máximo de 500 carecteres.'),
  date: z.date(),
  organization: z.string(),
  location: z.string().min(1, 'El evento debe tener una ubicación.'),
  type: z.enum(EventType),
  isPrivate: z.boolean(),
  participants: z.array(mongoId),
  activities: z.array(
    z.object({
      name: z.string(),
    }),
  ),
});
