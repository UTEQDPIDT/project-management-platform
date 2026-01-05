import { z } from 'zod';

export const trlAssessmentSchema = z.object({
  answers: z.record(z.string(), z.boolean()),
});
