export type ContentSource = 'master' | 'ai' | 'manual';

export interface DraftBullet {
  text: string;
  source: ContentSource;
}

export interface DraftWorkProject {
  name: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  contribution?: string;
  responsibilities?: DraftBullet[];
  technologies?: string[];
  outcome?: string;
  source: ContentSource;
}

export interface DraftWorkRole {
  roleId: string;
  title: string;
  companyName: string;
  startDate?: string;
  endDate?: string;
  workArrangement?: string;
  responsibilities: DraftBullet[];
  achievements: DraftBullet[];
  technologies?: string[];
  projects?: DraftWorkProject[];
  source: ContentSource;
}

export interface DraftEducation {
  educationId: string;
  institution: string;
  degree?: string;
  field?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  honors?: string;
  activities?: string[];
  source: ContentSource;
}

export interface DraftSkill {
  skillId: string;
  name: string;
  category?: string;
  level?: string;
  source: ContentSource;
}

export interface DraftCertification {
  certificationId: string;
  name: string;
  issuer?: string;
  issueDate?: string;
  source: ContentSource;
}

export interface DraftAward {
  awardId: string;
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
  source: ContentSource;
}

export interface DraftProject {
  projectId: string;
  name: string;
  description?: string;
  role?: string;
  technologies?: string[];
  url?: string;
  repoUrl?: string;
  source: ContentSource;
}

export interface DraftVolunteeringRole {
  volunteeringId: string;
  organization: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  responsibilities?: DraftBullet[];
  source: ContentSource;
}

export interface DraftPublication {
  publicationId: string;
  title: string;
  authors?: string;
  publisher?: string;
  date?: string;
  url?: string;
  source: ContentSource;
}

export interface ResumeDraftContent {
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  targetTitle?: string;
  summary?: string;
  workExperience: DraftWorkRole[];
  education: DraftEducation[];
  skills: DraftSkill[];
  certifications: DraftCertification[];
  awards: DraftAward[];
  projects: DraftProject[];
  volunteering: DraftVolunteeringRole[];
  publications: DraftPublication[];
}

export function emptyDraftContent(): ResumeDraftContent {
  return {
    workExperience: [],
    education: [],
    skills: [],
    certifications: [],
    awards: [],
    projects: [],
    volunteering: [],
    publications: [],
  };
}
