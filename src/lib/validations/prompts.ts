import { z } from 'zod';

export const upsertPromptSchema = z.object({
  key: z.string(),
  template: z.string().min(1, 'Prompt cannot be empty'),
});

export const resetPromptSchema = z.object({
  key: z.string(),
});
