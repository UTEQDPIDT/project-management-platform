import { IActivity, Status } from '@repo/types';
import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * TRL Rating
 */
export const TRL_QUESTIONS = {
  1: [
    {
      id: 'trl1_basic_principles',
      label: 'Principios básicos observados y reportados',
    },
  ],
  2: [
    {
      id: 'trl2_concept_formulated',
      label: 'Concepto tecnológico y/o aplicación tecnológica formulada',
    },
  ],
  3: [
    {
      id: 'trl3_experimental_proof',
      label: 'Prueba experimental de concepto',
    },
  ],
  4: [
    {
      id: 'trl4_lab_validation',
      label: 'Validación tecnológica a nivel laboratorio.',
    },
  ],
  5: [
    {
      id: 'trl5_relevant_environment',
      label: 'Tecnología validada en condiciones de un entorno relevante',
    },
  ],
  6: [
    {
      id: 'trl6_relevant_demo',
      label: 'Demostración tecnológica en un ambiente relevante',
    },
  ],
  7: [
    {
      id: 'trl7_system_prototype',
      label:
        'Demostración de prototipo a nivel sistema en un ambiente operativo real',
    },
  ],
  8: [
    {
      id: 'trl8_system_complete',
      label: 'Sistema completo y evaluado',
    },
  ],
  9: [
    {
      id: 'trl9_system_operational',
      label: 'Sistema probado y terminado en entorno operacional',
    },
  ],
} as const;

export function calculateTRL(answers: Record<string, boolean>): number {
  let trl = 0;

  for (let level = 1; level <= 9; level++) {
    const questions = TRL_QUESTIONS[level as keyof typeof TRL_QUESTIONS];

    const passed = questions.every((q) => answers[q.id] === true);
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

// Calculate progress
export const calculateProgress = (activities: IActivity[]) => {
  const totalActivities = activities.length;
  const completedActivities = activities.filter(
    (a) => a.status === Status.COMPLETED,
  );
  const progress = Math.round(
    (completedActivities.length / totalActivities) * 100,
  );
  return progress;
};

// Concatenate strings separated by commas
export const concatWithCommaAndDot = (words: string[]) => {
  return words.map(String).join(', ') + '.';
};

export const copyValue = (value: string) => {
  navigator.clipboard.writeText(value);
  toast.success('Copiado al portapapeles');
};
