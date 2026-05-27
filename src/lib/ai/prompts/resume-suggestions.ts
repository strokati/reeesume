import { languageLabel } from '@/lib/utils/language';

const RESUME_SUGGESTIONS_BASE = `You are an expert resume writer and ATS optimizer. Given a job posting and a candidate's full master resume, suggest which items to include in a tailored resume for this specific application.

You MUST respond with ONLY valid JSON matching this exact schema (no markdown, no explanation):

{
  "summary": {
    "suggestion": "A rewritten professional summary targeted to this role",
    "reasoning": "Why this summary is better for this application"
  },
  "workExperience": [
    {
      "companyId": "exact ID from master resume",
      "roleId": "exact ID from master resume",
      "include": true,
      "relevanceScore": 85,
      "reasoning": "Why this role is relevant",
      "suggestedBullets": ["Rewritten bullet 1", "Rewritten bullet 2"]
    }
  ],
  "skills": [
    {
      "skillId": "exact ID from master resume",
      "include": true,
      "reasoning": "Why this skill matters"
    }
  ],
  "projects": [
    {
      "projectId": "exact ID from master resume",
      "include": true,
      "relevanceScore": 75,
      "reasoning": "Why this project is relevant"
    }
  ],
  "sectionOrder": ["Summary", "Work Experience", "Skills", "Education", "Projects"]
}

Rules:
- Use the EXACT IDs from the master resume data provided. Never invent IDs.
- relevanceScore must be 0-100.
- suggestedBullets should be action-verb-led and tailored to the job posting keywords.
- sectionOrder should prioritize the most relevant sections first.
- Be selective: only include items that genuinely strengthen the application.
- If the vacancy analysis is available, use its keywords and requirements to guide suggestions.`;

export function buildResumeSuggestionsSystem(language: string): string {
	return `${RESUME_SUGGESTIONS_BASE}

Output language: ${languageLabel(language)}.
Write all suggested bullets and the summary rewrite in ${languageLabel(language)}.
Apply ${languageLabel(language)}-market resume conventions.`;
}

export interface ResumeSuggestions {
	summary: {
		suggestion: string;
		reasoning: string;
	};
	workExperience: {
		companyId: string;
		roleId: string;
		include: boolean;
		relevanceScore: number;
		reasoning: string;
		suggestedBullets: string[];
	}[];
	skills: {
		skillId: string;
		include: boolean;
		reasoning: string;
	}[];
	projects: {
		projectId: string;
		include: boolean;
		relevanceScore: number;
		reasoning: string;
	}[];
	sectionOrder: string[];
}

export function buildResumeSuggestionsPrompt(params: {
	vacancyText: string;
	vacancyAnalysis: unknown;
	masterResumeSummary: string;
	workItems: { companyId: string; companyName: string; roleId: string; roleTitle: string; responsibilities?: string[]; achievements?: string[] }[];
	skillItems: { skillId: string; name: string; category?: string | null }[];
	projectItems: { projectId: string; name: string; description?: string | null; technologies?: string[] | null }[];
}): string {
	const workSection = params.workItems.length
		? `## Work Experience (with IDs)\n${params.workItems.map((w) =>
				`- Company: "${w.companyName}" (companyId: "${w.companyId}") | Role: "${w.roleTitle}" (roleId: "${w.roleId}")${w.responsibilities?.length ? `\n  Responsibilities: ${w.responsibilities.join('; ')}` : ''}${w.achievements?.length ? `\n  Achievements: ${w.achievements.join('; ')}` : ''}`,
			).join('\n')}`
		: '## Work Experience\nNo work experience entries.';

	const skillsSection = params.skillItems.length
		? `## Skills (with IDs)\n${params.skillItems.map((s) =>
				`- "${s.name}" (skillId: "${s.skillId}")${s.category ? ` [${s.category}]` : ''}`,
			).join('\n')}`
		: '## Skills\nNo skills listed.';

	const projectsSection = params.projectItems.length
		? `## Projects (with IDs)\n${params.projectItems.map((p) =>
				`- "${p.name}" (projectId: "${p.projectId}")${p.description ? `: ${p.description}` : ''}${p.technologies?.length ? ` [${p.technologies.join(', ')}]` : ''}`,
			).join('\n')}`
		: '## Projects\nNo projects listed.';

	const analysisSection = params.vacancyAnalysis
		? `## Vacancy AI Analysis\n${JSON.stringify(params.vacancyAnalysis, null, 2)}`
		: '';

	return `## Job Posting

${params.vacancyText}

${analysisSection}

## Master Resume Summary

${params.masterResumeSummary}

${workSection}

${skillsSection}

${projectsSection}

Analyze this job posting against the candidate's master resume. Suggest which items to include in a tailored resume, with rewritten bullets emphasizing relevant skills. Use the EXACT IDs provided above.`;
}
