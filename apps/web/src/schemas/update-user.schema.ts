import {
  CareerLevel,
  EducationLevel,
  ResearcherType,
  Sex,
  SniiLevel,
  UserType,
} from '@repo/types';
import { z } from 'zod';
import { mongoId } from '@/lib/utils';

export const updateUserSchema = z.object({
  givenName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(40, 'El nombre no puede exceder 40 caracteres'),
  familyName: z
    .string()
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(40, 'El apellido no puede exceder 40 caracteres'),
  type: z.enum(UserType, 'No es una opción válida').optional(),
  sex: z.enum(Sex, 'No es una opción válida').nullable(),
  hasDisability: z.boolean().nullable(),
  speaksIndigenousLanguage: z.boolean().nullable(),
  researcherType: z.enum(ResearcherType, 'No es una opción válida').nullable(),
  educationLevel: z.enum(EducationLevel, 'No es una opción válida').nullable(),
  sniiLevel: z.enum(SniiLevel, 'No es una opción válida').nullable(),
  dateOfBirth: z
    .date()
    .max(new Date('2009-1-1'), 'Debes tener por lo menos 17 años.')
    .min(new Date('1940-01-01'), 'Fecha no válida'),
  careerLevel: z.enum(CareerLevel, 'No es una opción válida').optional(),
  division: mongoId.optional().or(z.literal('')),
  educationalProgram: mongoId.optional().or(z.literal('')),
});

export type UpdateUser = z.infer<typeof updateUserSchema>;
