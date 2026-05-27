import { z } from 'zod';

// Contact Info
export const ContactInfoSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  website: z.string().optional(),
});

// Work Company
export const CreateWorkCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export const UpdateWorkCompanySchema = CreateWorkCompanySchema.partial();

// Work Role
export const CreateWorkRoleSchema = z.object({
  title: z.string().min(1, 'Role title is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
});
export const UpdateWorkRoleSchema = CreateWorkRoleSchema.partial();

// Work Project
export const CreateWorkProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  contribution: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  outcome: z.string().optional(),
});
export const UpdateWorkProjectSchema = CreateWorkProjectSchema.partial();

// Education
export const CreateEducationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().optional(),
  field: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  honors: z.string().optional(),
  activities: z.array(z.string()).optional(),
});
export const UpdateEducationSchema = CreateEducationSchema.partial();

// Skill
export const CreateSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().optional(),
  level: z.enum(['Beginner', 'Intermediate', 'Expert']).optional(),
});
export const UpdateSkillSchema = CreateSkillSchema.partial();

// Certification
export const CreateCertificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  url: z.string().optional(),
});
export const UpdateCertificationSchema = CreateCertificationSchema.partial();

// Award
export const CreateAwardSchema = z.object({
  title: z.string().min(1, 'Award title is required'),
  issuer: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});
export const UpdateAwardSchema = CreateAwardSchema.partial();

// Project (personal / open-source)
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  role: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  url: z.string().optional(),
  repoUrl: z.string().optional(),
});
export const UpdateProjectSchema = CreateProjectSchema.partial();

// Volunteering Role
export const CreateVolunteeringRoleSchema = z.object({
  organization: z.string().min(1, 'Organization is required'),
  role: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
});
export const UpdateVolunteeringRoleSchema = CreateVolunteeringRoleSchema.partial();

// Publication
export const CreatePublicationSchema = z.object({
  title: z.string().min(1, 'Publication title is required'),
  authors: z.string().optional(),
  publisher: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
  doi: z.string().optional(),
  description: z.string().optional(),
});
export const UpdatePublicationSchema = CreatePublicationSchema.partial();

// Reorder
export const ReorderSchema = z.array(z.string().min(1));

// Multi-resume management
export const CreateMasterResumeSchema = z.object({
  name: z.string().min(1).max(60),
  language: z.string().min(2).max(10),
});

export const RenameMasterResumeSchema = z.object({
  name: z.string().min(1).max(60),
});

export const SetLanguageSchema = z.object({
  language: z.string().min(2).max(10),
});

export type CreateMasterResumeInput = z.infer<typeof CreateMasterResumeSchema>;

// Type exports
export type ContactInfoInput = z.infer<typeof ContactInfoSchema>;
export type CreateWorkCompanyInput = z.infer<typeof CreateWorkCompanySchema>;
export type UpdateWorkCompanyInput = z.infer<typeof UpdateWorkCompanySchema>;
export type CreateWorkRoleInput = z.infer<typeof CreateWorkRoleSchema>;
export type UpdateWorkRoleInput = z.infer<typeof UpdateWorkRoleSchema>;
export type CreateWorkProjectInput = z.infer<typeof CreateWorkProjectSchema>;
export type UpdateWorkProjectInput = z.infer<typeof UpdateWorkProjectSchema>;
export type CreateEducationInput = z.infer<typeof CreateEducationSchema>;
export type UpdateEducationInput = z.infer<typeof UpdateEducationSchema>;
export type CreateSkillInput = z.infer<typeof CreateSkillSchema>;
export type UpdateSkillInput = z.infer<typeof UpdateSkillSchema>;
export type CreateCertificationInput = z.infer<typeof CreateCertificationSchema>;
export type UpdateCertificationInput = z.infer<typeof UpdateCertificationSchema>;
export type CreateAwardInput = z.infer<typeof CreateAwardSchema>;
export type UpdateAwardInput = z.infer<typeof UpdateAwardSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type CreateVolunteeringRoleInput = z.infer<typeof CreateVolunteeringRoleSchema>;
export type UpdateVolunteeringRoleInput = z.infer<typeof UpdateVolunteeringRoleSchema>;
export type CreatePublicationInput = z.infer<typeof CreatePublicationSchema>;
export type UpdatePublicationInput = z.infer<typeof UpdatePublicationSchema>;
