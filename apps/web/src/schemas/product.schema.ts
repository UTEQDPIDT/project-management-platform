import { mongoId } from '@/lib/utils';
import { CoAuthor } from '@repo/types';
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'El producto necesita un nombre.'),
  details: z
    .string()
    .max(255, 'Excede el máximo de 255 caracteres.')
    .optional(),
  category: mongoId.or(z.literal('')),
  subcategory: mongoId.or(z.literal('')),
  coAuthor: z.enum(CoAuthor),
});
