import { CareerLevel, Sex, State, UserType } from '@repo/types';
import { z } from 'zod';
import { mongoId } from '@/lib/utils';

export const updateUserSchema = z.object({
  givenName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre no puede exceder 80 caracteres'),
  familyName: z
    .string()
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(80, 'El apellido no puede exceder 80 caracteres'),
  type: z.enum(UserType, 'No es una opción válida').optional(),
  sex: z.enum(Sex, 'No es una opción válida'),
  state: z.enum(State, 'No es una opción válida'),
  dateOfBirth: z
    .date()
    .max(new Date('2009-1-1'), 'Debes tener por lo menos 17 años.')
    .min(new Date('1940-01-01'), 'Fecha no válida'),
  matricula: z
    .string()
    .regex(/^[0-9]+$/, 'La matrícula debe contener solo números')
    .length(10, 'La matricula debe tener 10 caracteres')
    .trim()
    .optional()
    .or(z.literal('')), // Accept empty string
  employeeNumber: z
    .string()
    .regex(/^[0-9]+$/, 'El número de empleado debe contener solo números')
    .min(5, 'El número de empleado debe tener un mínimo de 5 caracteres')
    .max(10, 'El número de empleado debe tener un máximo de 10 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  careerLevel: z.enum(CareerLevel, 'No es una opción válida').optional(),
  division: mongoId.optional().or(z.literal('')),
  educationalProgram: mongoId.optional().or(z.literal('')),
});

export type UpdateUser = z.infer<typeof updateUserSchema>;
