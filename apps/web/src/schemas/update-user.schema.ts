import { CareerLevel, Sex, State, UserType } from '@repo/types';
import { z } from 'zod';
import { mongoId } from '@/lib/utils';

export const updateUserSchema = z.object({
  type: z.enum(UserType).optional(),
  sex: z.enum(Sex),
  state: z.enum(State),
  dateOfBirth: z.date(),
  matricula: z
    .string()
    .regex(/^[0-9]+$/, 'La matrícula debe contener solo números')
    .length(10, 'La matricula debe tener 10 caracteres')
    .trim()
    .optional(),
  employeeNumber: z
    .string()
    .regex(/^[0-9]+$/, 'El número de empleado debe contener solo números')
    .min(5, 'El número de empleado debe tener un mínimo de 5 caracteres')
    .max(10, 'El número de empleado debe tener un máximo de 10 caracteres')
    .trim()
    .optional(),
  careerLevel: z.enum(CareerLevel).optional(),
  division: mongoId.optional(),
  educationalProgram: mongoId.optional(),
});

export type UpdateUser = z.infer<typeof updateUserSchema>;
