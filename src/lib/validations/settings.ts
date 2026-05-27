import { z } from 'zod';

export const UpsertAiProviderSchema = z.object({
  providerId: z.string().min(1),
  apiKey: z.string().optional(),
  model: z.string().min(1, 'Model is required'),
  baseUrl: z.string().url().optional().or(z.literal('')),
  displayName: z.string().optional(),
});

export type UpsertAiProviderInput = z.infer<typeof UpsertAiProviderSchema>;
