import { z } from 'zod';

function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T;
}

const absentToUndefined = (value: unknown) => {
  if (value === null) return undefined;
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
};

const optionalString = z.preprocess(absentToUndefined, z.string().optional());
const optionalStringArray = z.preprocess(absentToUndefined, z.array(z.string()).optional());
const optionalEmploymentType = z.preprocess(
  absentToUndefined,
  z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance']).optional()
);
const optionalSkillLevel = z.preprocess(
  absentToUndefined,
  z.enum(['Beginner', 'Intermediate', 'Expert']).optional()
);

export const IMPORT_RESUME_SYSTEM = `You are an expert resume parser that handles resumes in ANY language (German, English, French, Spanish, etc.).

Your task: extract ALL information from the resume and output a single valid JSON object matching this exact structure:

{
  "detectedLanguage": "de",
  "contactInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "website": "string"
  },
  "targetTitle": "string — the person's current or desired job title",
  "professionalSummary": "string — summary or profile section (Profil, Zusammenfassung, etc.)",
  "workCompanies": [
    {
      "name": "string — company name (Arbeitgeber, Unternehmen, etc.)",
      "location": "string",
      "employmentType": "Full-time | Part-time | Contract | Freelance",
      "startDate": "string",
      "endDate": "string",
      "roles": [
        {
          "title": "string — job title (Stellenbezeichnung, Position, etc.)",
          "startDate": "string",
          "endDate": "string",
          "responsibilities": ["string"],
          "achievements": ["string"],
          "technologies": ["string"]
        }
      ]
    }
  ],
  "educations": [
    {
      "institution": "string — university or school name (Universität, Hochschule, Schule, etc.)",
      "degree": "string — degree type (Bachelor, Master, Diplom, Ausbildung, etc.)",
      "field": "string — field of study (Studiengang, Fachrichtung, etc.)",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "gpa": "string",
      "honors": "string",
      "activities": ["string"]
    }
  ],
  "skills": [
    {
      "name": "string — skill name",
      "category": "string — e.g. Programming Languages, Frameworks, Tools, Languages, Interests",
      "level": "Beginner | Intermediate | Expert"
    }
  ],
  "certifications": [
    {
      "name": "string — certificate name (Zertifikat, Zertifizierung, etc.)",
      "issuer": "string",
      "issueDate": "string",
      "expiryDate": "string",
      "credentialId": "string",
      "url": "string"
    }
  ],
  "awards": [
    {
      "title": "string — award name (Auszeichnung, Preis, Stipendium, etc.)",
      "issuer": "string",
      "date": "string",
      "description": "string"
    }
  ],
  "projects": [
    {
      "name": "string — project name (Projekt, etc.)",
      "description": "string",
      "role": "string",
      "startDate": "string",
      "endDate": "string",
      "technologies": ["string"],
      "url": "string",
      "repoUrl": "string"
    }
  ],
  "volunteeringRoles": [
    {
      "organization": "string — organization name (Ehrenamt, Freiwilligenarbeit, etc.)",
      "role": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "responsibilities": ["string"]
    }
  ],
  "publications": [
    {
      "title": "string — publication title (Publikation, Veröffentlichung, etc.)",
      "authors": "string",
      "publisher": "string",
      "date": "string",
      "url": "string",
      "doi": "string",
      "description": "string"
    }
  ]
}

Rules:
- The resume may be in German or any other language — recognize all section headings regardless of language.
- Extract EVERY piece of information. Be thorough. Do not skip sections.
- LinkedIn URLs: extract any linkedin.com/in/... URL into contactInfo.linkedin. Do NOT put it in website.
- GitHub URLs: extract any github.com/... URL into contactInfo.github. Do NOT put it in website.
- If the resume header contains URLs, classify them: linkedin.com → linkedin, github.com → github, everything else → website.
- German section headings to recognize: Berufserfahrung/Berufliche Erfahrung = workCompanies; Ausbildung/Studium = educations; Kenntnisse/Fähigkeiten/Kompetenzen = skills; Zertifikate/Zertifizierungen = certifications; Auszeichnungen/Preise = awards; Projekte = projects; Ehrenamt/Engagement = volunteeringRoles; Publikationen/Veröffentlichungen = publications; Profil/Über mich/Zusammenfassung = professionalSummary.
- Rewrite vague responsibilities as action-verb-led bullet points. Keep them in the original language.
- Preserve the original language of the resume. Do NOT translate. Extract content as-is in the source language.
- "detectedLanguage": 2-letter BCP-47 language code of the source document (e.g. "de", "en", "fr").
- Dates: keep the original format (e.g. "Jan 2020", "2020-01", "seit 2020" → "2020–present").
- Omit fields that are truly absent. Do not invent data.
- Output ONLY the JSON object, no prose, no markdown fences.`;

export const ImportedResumeSchema = z.object({
  detectedLanguage: optionalString,
  contactInfo: z
    .object({
      name: optionalString,
      email: optionalString,
      phone: optionalString,
      location: optionalString,
      linkedin: optionalString,
      github: optionalString,
      website: optionalString,
    })
    .transform(omitUndefined)
    .optional(),
  targetTitle: optionalString,
  professionalSummary: optionalString,
  workCompanies: z
    .array(
      z.object({
        name: z.string(),
        location: optionalString,
        employmentType: optionalEmploymentType,
        startDate: optionalString,
        endDate: optionalString,
        roles: z.array(
          z.object({
            title: z.string(),
            startDate: optionalString,
            endDate: optionalString,
            responsibilities: optionalStringArray,
            achievements: optionalStringArray,
            technologies: optionalStringArray,
            projects: z
              .array(
                z.object({
                  name: z.string(),
                  startDate: optionalString,
                  endDate: optionalString,
                  description: optionalString,
                  contribution: optionalString,
                  technologies: optionalStringArray,
                  outcome: optionalString,
                })
              )
              .optional(),
          })
        ),
      })
    )
    .optional(),
  educations: z
    .array(
      z.object({
        institution: z.string(),
        degree: optionalString,
        field: optionalString,
        location: optionalString,
        startDate: optionalString,
        endDate: optionalString,
        gpa: optionalString,
        honors: optionalString,
        activities: optionalStringArray,
      })
    )
    .optional(),
  skills: z
    .array(
      z.object({
        name: z.string(),
        category: optionalString,
        level: optionalSkillLevel,
      })
    )
    .optional(),
  certifications: z
    .array(
      z.object({
        name: z.string(),
        issuer: optionalString,
        issueDate: optionalString,
        expiryDate: optionalString,
        credentialId: optionalString,
        url: optionalString,
      })
    )
    .optional(),
  awards: z
    .array(
      z.object({
        title: z.string(),
        issuer: optionalString,
        date: optionalString,
        description: optionalString,
      })
    )
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: optionalString,
        role: optionalString,
        startDate: optionalString,
        endDate: optionalString,
        technologies: optionalStringArray,
        url: optionalString,
        repoUrl: optionalString,
      })
    )
    .optional(),
  volunteeringRoles: z
    .array(
      z.object({
        organization: z.string(),
        role: optionalString,
        location: optionalString,
        startDate: optionalString,
        endDate: optionalString,
        responsibilities: optionalStringArray,
      })
    )
    .optional(),
  publications: z
    .array(
      z.object({
        title: z.string(),
        authors: optionalString,
        publisher: optionalString,
        date: optionalString,
        url: optionalString,
        doi: optionalString,
        description: optionalString,
      })
    )
    .optional(),
});

export type ImportedResumeData = z.infer<typeof ImportedResumeSchema>;

export function getSectionCounts(data: ImportedResumeData): Record<string, number> {
  return {
    'Contact Info': data.contactInfo ? Object.values(data.contactInfo).filter(Boolean).length : 0,
    'Target Title': data.targetTitle ? 1 : 0,
    'Professional Summary': data.professionalSummary ? 1 : 0,
    'Work Companies': data.workCompanies?.length ?? 0,
    'Work Roles': data.workCompanies?.reduce((sum, c) => sum + c.roles.length, 0) ?? 0,
    Education: data.educations?.length ?? 0,
    Skills: data.skills?.length ?? 0,
    Certifications: data.certifications?.length ?? 0,
    Awards: data.awards?.length ?? 0,
    Projects: data.projects?.length ?? 0,
    Volunteering: data.volunteeringRoles?.length ?? 0,
    Publications: data.publications?.length ?? 0,
  };
}
