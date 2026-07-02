import { z } from 'zod';

export const ARCHIVE_VERSION = 1 as const;

/**
 * Shape of a Reeesume data-export archive.
 *
 * Top-level arrays contain nested objects (children ride along inside their
 * parents) so the file stays human-readable. Leaf objects use `.passthrough()`
 * via `z.record(z.unknown())` so that fields added by newer app versions don't
 * cause older- or newer-version archives to be rejected outright — the version
 * constant above is the only compatibility gate.
 */
export const UserArchiveSchema = z.object({
  version: z.literal(ARCHIVE_VERSION),
  appVersion: z.string(),
  createdAt: z.string().datetime(),
  userId: z.string(),
  user: z.record(z.string(), z.unknown()),
  masterResumes: z.array(z.record(z.string(), z.unknown())),
  vacancies: z.array(z.record(z.string(), z.unknown())),
  applications: z.array(z.record(z.string(), z.unknown())),
  aiProviderConfigs: z.array(z.record(z.string(), z.unknown())),
  aiCallLogs: z.array(z.record(z.string(), z.unknown())),
  aiPromptOverrides: z.array(z.record(z.string(), z.unknown())),
});

export type UserArchive = z.infer<typeof UserArchiveSchema>;
