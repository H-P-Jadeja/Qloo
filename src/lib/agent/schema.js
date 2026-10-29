import { z } from 'zod';
export const PlanSchema = z.object({
  summary: z.string(),
  tasteDna: z.array(z.string()).optional(),
  sections: z.array(z.object({
    key: z.string(), title: z.string(),
    picks: z.array(z.object({ qlooId: z.string(), reason: z.string(), evidenceId: z.string().optional() })),
  })),
});
