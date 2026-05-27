import { languageLabel } from '@/lib/utils/language';

const ATS_CHECK_BASE = `You are an expert ATS (Applicant Tracking System) analyst. Analyze a resume against a job posting and return a detailed compatibility check.

You MUST respond with ONLY valid JSON matching this exact schema (no markdown, no explanation):

{
  "overallScore": 74,
  "subScores": {
    "keywordMatch": 88,
    "formatting": 90,
    "sectionCompleteness": 80,
    "readability": 60
  },
  "keywordCoverage": {
    "found": ["keyword found in resume"],
    "missing": ["important keyword not in resume"]
  },
  "recommendations": [
    {
      "priority": "HIGH",
      "category": "Keywords",
      "issue": "Missing keyword: GraphQL",
      "fix": "Add GraphQL to the Skills section"
    }
  ],
  "summary": "2-3 sentence overall assessment of ATS compatibility."
}

Rules:
- overallScore and all subScores must be 0-100.
- Be specific and actionable. Don't say "improve keywords" — say "Add 'GraphQL' to the Skills section."
- recommendations should be sorted by priority: HIGH first, then MED, then LOW.
- Check for: missing keywords from job posting, ATS-unfriendly formatting (tables, graphics, headers/footers), incomplete sections, passive voice, vague bullets.
- keywordCoverage.found should list important job posting keywords that ARE present in the resume.
- keywordCoverage.missing should list important keywords that are NOT present.
- Generate at least 3-8 recommendations.`;

export function buildAtsCheckSystem(language: string): string {
  return `${ATS_CHECK_BASE}

Target market: ${languageLabel(language)}.
Apply ATS scoring for ${languageLabel(language)}-speaking markets.
For German ("de"):
- Flag missing German-specific sections: Persönliche Daten, Ausbildung format, Zertifikate
- Check for DACH-common keywords relevant to the role
- Note: German CVs typically include date of birth, photo, nationality — flag if absent when relevant
- Reference German ATS tools: Softgarden, Personio, d.vinci
For English ("en") or international:
- Standard ATS keyword density, action verbs, quantified achievements
- Reference international ATS tools: Workday, Greenhouse, Lever
Score and recommend in English but reference market-specific expectations where relevant.`;
}

export interface AtsCheckResult {
  overallScore: number;
  subScores: {
    keywordMatch: number;
    formatting: number;
    sectionCompleteness: number;
    readability: number;
  };
  keywordCoverage: {
    found: string[];
    missing: string[];
  };
  recommendations: {
    priority: 'HIGH' | 'MED' | 'LOW';
    category: string;
    issue: string;
    fix: string;
  }[];
  summary: string;
}

export function buildAtsCheckPrompt(resumeText: string, vacancyText: string): string {
  return `## Resume Content

${resumeText}

## Job Posting

${vacancyText}

Analyze this resume against the job posting for ATS compatibility. Score keyword match, formatting, section completeness, and readability. List found and missing keywords. Provide specific, actionable recommendations sorted by priority.`;
}

export function resumeContentToText(content: unknown): string {
  if (!content) return '(empty resume)';
  if (typeof content === 'string') return content;

  const data = content as Record<string, unknown>;
  const parts: string[] = [];

  if (data.contactInfo) {
    const c = data.contactInfo as Record<string, unknown>;
    parts.push(`Contact: ${[c.name, c.email, c.phone, c.location].filter(Boolean).join(' | ')}`);
  }
  if (data.targetTitle) parts.push(`Target Title: ${data.targetTitle}`);
  if (data.summary) parts.push(`Professional Summary: ${data.summary}`);

  if (Array.isArray(data.workExperience)) {
    for (const w of data.workExperience) {
      const entry = w as Record<string, unknown>;
      parts.push(`\nWork: ${entry.company ?? ''} — ${entry.title ?? ''}`);
      if (entry.startDate || entry.endDate)
        parts.push(`  Period: ${entry.startDate ?? ''} - ${entry.endDate ?? 'present'}`);
      if (Array.isArray(entry.bullets)) {
        for (const b of entry.bullets) parts.push(`  • ${b}`);
      }
    }
  }

  if (Array.isArray(data.education)) {
    parts.push('\nEducation:');
    for (const e of data.education) {
      const entry = e as Record<string, unknown>;
      parts.push(`  ${entry.degree ?? ''} ${entry.field ?? ''} — ${entry.institution ?? ''}`);
    }
  }

  if (Array.isArray(data.skills)) {
    parts.push(
      `\nSkills: ${data.skills.map((s: Record<string, unknown>) => s.name ?? s).join(', ')}`
    );
  }

  if (Array.isArray(data.certifications)) {
    parts.push(
      `\nCertifications: ${data.certifications.map((c: Record<string, unknown>) => c.name ?? c).join(', ')}`
    );
  }

  if (Array.isArray(data.projects)) {
    parts.push('\nProjects:');
    for (const p of data.projects) {
      const entry = p as Record<string, unknown>;
      parts.push(`  ${entry.name ?? ''}${entry.description ? `: ${entry.description}` : ''}`);
    }
  }

  if (Array.isArray(data.awards)) {
    parts.push(
      `\nAwards: ${data.awards.map((a: Record<string, unknown>) => a.title ?? a).join(', ')}`
    );
  }

  if (Array.isArray(data.volunteering)) {
    parts.push('\nVolunteering:');
    for (const v of data.volunteering) {
      const entry = v as Record<string, unknown>;
      parts.push(`  ${entry.role ?? ''} at ${entry.organization ?? ''}`);
    }
  }

  if (Array.isArray(data.publications)) {
    parts.push(
      `\nPublications: ${data.publications.map((p: Record<string, unknown>) => p.title ?? p).join(', ')}`
    );
  }

  return parts.join('\n') || '(empty resume)';
}
