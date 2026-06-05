import { DEFAULT_SECTION_ORDER } from './types';
import type { ResumeData, ContactInfo, WorkExperienceItem, SkillItem } from './types';
import type { ResumeDraftContent } from '@/types/resume-draft';

export function convertDraftToResumeData(draftContent: ResumeDraftContent): ResumeData {
  const content = draftContent;

  const contactInfo: ContactInfo = {
    name: content.contactInfo?.name,
    email: content.contactInfo?.email,
    phone: content.contactInfo?.phone,
    location: content.contactInfo?.location,
    linkedin: content.contactInfo?.linkedin,
    github: content.contactInfo?.github,
    website: content.contactInfo?.website,
  };

  const workExperience: WorkExperienceItem[] = (content.workExperience ?? []).map((role) => ({
    companyName: role.companyName,
    title: role.title,
    startDate: role.startDate,
    endDate: role.endDate,
    workArrangement: role.workArrangement,
    responsibilities: role.responsibilities?.map((b) => b.text) ?? [],
    achievements: role.achievements?.map((b) => b.text) ?? [],
    technologies: role.technologies,
    projects: role.projects?.map((p) => ({
      name: p.name,
      startDate: p.startDate,
      endDate: p.endDate,
      description: p.description,
      responsibilities: p.responsibilities?.map((b) => b.text),
      technologies: p.technologies,
    })),
  }));

  const skills: SkillItem[] = (content.skills ?? []).map((s) => ({
    name: s.name,
    category: s.category,
    level: s.level,
  }));

  return {
    contactInfo,
    targetTitle: content.targetTitle,
    summary: content.summary,
    workExperience,
    education: (content.education ?? []).map((e) => ({
      institution: e.institution,
      degree: e.degree,
      field: e.field,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      gpa: e.gpa,
      honors: e.honors,
    })),
    skills,
    certifications: (content.certifications ?? []).map((c) => ({
      name: c.name,
      issuer: c.issuer,
      issueDate: c.issueDate,
    })),
    awards: (content.awards ?? []).map((a) => ({
      title: a.title,
      issuer: a.issuer,
      date: a.date,
    })),
    projects: (content.projects ?? []).map((p) => ({
      name: p.name,
      description: p.description,
      role: p.role,
      technologies: p.technologies,
      url: p.url,
    })),
    volunteering: (content.volunteering ?? []).map((v) => ({
      organization: v.organization,
      role: v.role,
      startDate: v.startDate,
      endDate: v.endDate,
      responsibilities: v.responsibilities?.map((b) => b.text),
    })),
    publications: (content.publications ?? []).map((p) => ({
      title: p.title,
      authors: p.authors,
      publisher: p.publisher,
      date: p.date,
      url: p.url,
    })),
    sectionOrder: DEFAULT_SECTION_ORDER,
  };
}
