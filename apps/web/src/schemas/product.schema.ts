import { z } from 'zod';
import { mongoId } from '@/lib/utils';
import { CoAuthor } from '@repo/types';

export const getProductSchema = (isUpdate: boolean) =>
  z.object({
    name: z.string().min(1, 'El producto necesita un nombre.'),
    category: mongoId,
    subcategory: mongoId,
    coAuthor: z.enum(CoAuthor),
    file: isUpdate
      ? z
          .instanceof(File)
          .refine(
            (file) => file.size <= 5 * 1024 * 1024,
            'El archivo pesa más de 5 MB',
          )
          .refine(
            (file) => file.type === 'application/pdf',
            'Solo se aceptan archivos PDF',
          )
          .optional()
      : z
          .instanceof(File, { message: 'El archivo es obligatorio.' })
          .refine(
            (file) => file.size <= 2 * 1024 * 1024,
            'El archivo pesa más de 2 MB',
          )
          .refine(
            (file) => file.type === 'application/pdf',
            'Solo se aceptan archivos PDF',
          ),
  });