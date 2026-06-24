import { z } from 'zod';

export const ApplicationStatusValues = [
  'saved',
  'planned',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'on_hold',
] as const;

export const LocationTypeValues = ['On-site', 'Hybrid', 'Remote'] as const;

export const CreateApplicationSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  location: z.string().optional(),
  locationType: z.enum(LocationTypeValues).optional(),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  proposedSalary: z.string().optional(),
  currency: z.string().optional(),
  sourceUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  rawText: z.string().optional(),
  masterResumeId: z.string().min(1),
});

export const UpdateApplicationStatusSchema = z.object({
  status: z.enum(ApplicationStatusValues),
});

export const UpdateExcitementSchema = z.object({
  excitement: z.number().int().min(1).max(5),
});

export const UpdateTrackingSchema = z.object({
  dateApplied: z.string().optional(),
  interviewDate: z.string().optional(),
  offerDate: z.string().optional(),
  rejectedDate: z.string().optional(),
  salaryMin: z.number().int().positive().optional().nullable(),
  salaryMax: z.number().int().positive().optional().nullable(),
  proposedSalary: z.number().int().positive().optional().nullable(),
  excitement: z.number().int().min(1).max(5).optional(),
});

export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;
export type ApplicationStatus = (typeof ApplicationStatusValues)[number];
