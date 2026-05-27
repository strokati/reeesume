import { languageLabel } from '@/lib/utils/language';

const ANALYZE_VACANCY_BASE = `You are an expert career coach and ATS optimizer. Analyze job postings and return a structured JSON breakdown.

You MUST respond with ONLY valid JSON matching this exact schema (no markdown, no explanation):

{
  "summary": "2-3 sentence summary of the role",
  "responsibilities": ["key responsibility 1", "key responsibility 2"],
  "mustHaves": ["required qualification 1", "required qualification 2"],
  "niceToHaves": ["preferred qualification 1", "preferred qualification 2"],
  "atsKeywords": ["important keyword 1", "important keyword 2"],
  "tone": "formal | startup-casual | technical | corporate | academic",
  "companyCulture": "Brief read on company culture and work environment",
  "masterResumeMatchPreview": {
    "relevant": ["skill or experience from master resume that matches"],
    "gaps": ["requirement not covered by master resume"]
  }
}

Be specific and actionable. Extract 5-10 items per list where possible.`;

export function buildAnalyzeVacancySystem(language: string): string {
  return `${ANALYZE_VACANCY_BASE}

The candidate's target market is: ${languageLabel(language)} (language code: ${language}).
Tailor your analysis for this market:
- For "de": apply DACH-market conventions (Lebenslauf style, DACH ATS tools, German job titles).
- For "en": apply international / English-speaking market conventions.
- For other languages: apply conventions typical of that language's job market.
Output language: English (for consistency in the app UI), but flag market-specific terms.`;
}

export function analyzeVacancyPrompt(vacancyText: string, masterResumeSummary: string): string {
  return `## Job Posting

${vacancyText}

## Candidate's Master Resume Summary

${masterResumeSummary}

Analyze this job posting. Identify key responsibilities, must-have and nice-to-have qualifications, ATS keywords, and how well the candidate's master resume matches. Be thorough and specific.`;
}

interface ResumeSummaryData {
  targetTitle?: string | null;
  professionalSummary?: string | null;
  workCompanies?: {
    companyName: string;
    roles: { jobTitle: string; startDate?: string | null; endDate?: string | null }[];
  }[];
  educations?: { institution: string; degree: string; field: string }[];
  skills?: { name: string; category?: string | null; level?: string | null }[];
  certifications?: { name: string; issuer: string }[];
  awards?: { title: string; issuer: string }[];
  projects?: { name: string; description?: string | null; technologies?: string | null }[];
  volunteeringRoles?: { organization: string; role: string }[];
  publications?: { title: string; publisher?: string | null }[];
}

export function summarizeMasterResume(data: ResumeSummaryData): string {
  const parts: string[] = [];

  if (data.targetTitle) parts.push(`Target Title: ${data.targetTitle}`);
  if (data.professionalSummary) parts.push(`Summary: ${data.professionalSummary}`);

  if (data.workCompanies?.length) {
    const jobs = data.workCompanies.map((c) =>
      c.roles
        .map(
          (r) =>
            `${r.jobTitle} at ${c.companyName} (${r.startDate ?? ''} - ${r.endDate ?? 'present'})`
        )
        .join('; ')
    );
    parts.push(`Work Experience: ${jobs.join(', ')}`);
  }

  if (data.educations?.length) {
    parts.push(
      `Education: ${data.educations.map((e) => `${e.degree} in ${e.field} from ${e.institution}`).join(', ')}`
    );
  }

  if (data.skills?.length) {
    const grouped: Record<string, string[]> = {};
    for (const s of data.skills) {
      const cat = s.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(`${s.name}${s.level ? ` (${s.level})` : ''}`);
    }
    parts.push(
      `Skills: ${Object.entries(grouped)
        .map(([cat, items]) => `${cat}: ${items.join(', ')}`)
        .join('; ')}`
    );
  }

  if (data.certifications?.length) {
    parts.push(
      `Certifications: ${data.certifications.map((c) => `${c.name} (${c.issuer})`).join(', ')}`
    );
  }

  if (data.projects?.length) {
    parts.push(
      `Projects: ${data.projects.map((p) => `${p.name}${p.technologies ? ` [${p.technologies}]` : ''}`).join(', ')}`
    );
  }

  if (data.volunteeringRoles?.length) {
    parts.push(
      `Volunteering: ${data.volunteeringRoles.map((v) => `${v.role} at ${v.organization}`).join(', ')}`
    );
  }

  if (data.publications?.length) {
    parts.push(
      `Publications: ${data.publications.map((p) => `${p.title}${p.publisher ? ` (${p.publisher})` : ''}`).join(', ')}`
    );
  }

  return parts.join('\n\n') || 'No master resume data available.';
}
