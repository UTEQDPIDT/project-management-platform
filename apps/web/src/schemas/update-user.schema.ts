import { CareerLevel, Sex, State, UserType } from '@repo/types';
import { z } from 'zod';
import { mongoId } from '@/lib/utils';

export const updateUserSchema = z.object({
  type: z.enum(UserType).optional(),
  sex: z.enum(Sex),
  state: z.enum(State),
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
  careerLevel: z.enum(CareerLevel).optional(),
  division: mongoId.optional().or(z.literal('')),
  educationalProgram: mongoId.optional().or(z.literal('')),
});

export type UpdateUser = z.infer<typeof updateUserSchema>;
