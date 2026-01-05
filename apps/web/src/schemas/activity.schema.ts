import { mongoId } from '@/lib/utils';
import { Priority, Status } from '@repo/types';
import { z } from 'zod';

export const activityZodSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'Excede 100 caracteres.'),
  description: z.string().max(255, 'Excede 255 caracteres.').optional(),
  status: z.enum(Status),
  priority: z.enum(Priority).optional(),
  checked: z.boolean().optional(),
  assignees: z.array(mongoId).optional(),
  dueDate: z.date().optional(),
  dueDateEnd: z.date().optional(),
});
