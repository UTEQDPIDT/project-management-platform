import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { z } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// MongoID regex
export const mongoId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'ID de mongo inválido');
