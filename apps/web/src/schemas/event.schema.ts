import { mongoId } from '@/lib/utils';
import { EventType } from '@repo/types';
import { z } from 'zod';

const attendanceSchema = z
  .object({
    totalParticipants: z.number().int().min(0),
    men: z.number().int().min(0),
    women: z.number().int().min(0),
  })
  .refine((data) => data.men + data.women <= data.totalParticipants, {
    message: 'La suma de hombres y mujeres no puede exceder el total de participantes',
    path: ['totalParticipants'],
  })
  .optional();

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
  attendance: attendanceSchema,
});
