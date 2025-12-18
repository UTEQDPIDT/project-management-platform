import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * TRL Rating
 */
export const TRL_QUESTIONS = {
  1: ['Basic principles observed'],
  2: ['Technology concept formulated'],
  3: ['Experimental proof of concept'],
  4: ['Technology validated in lab'],
  5: ['Technology validated in relevant environment'],
  6: ['Technology demonstrated in relevant environment'],
  7: ['System prototype demonstrated in operational environment'],
  8: ['System complete and qualified'],
  9: ['System proven in operational environment'],
} as const;

export function calculateTRL(answers: Record<string, boolean>): number {
  let trl = 0;

  for (let level = 1; level <= 9; level++) {
    const questions = TRL_QUESTIONS[level as keyof typeof TRL_QUESTIONS];

    const passed = questions.every((q) => answers[q] === true);
    if (passed) trl = level;
    else break;
  }

  return trl;
}

/**
 * Zod Schema Validations
 */
// MongoID regex
export const mongoId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'No es una opción válida');
