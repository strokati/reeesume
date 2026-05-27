import { languageLabel } from '@/lib/utils/language';

export type CoverLetterTone = 'professional' | 'confident' | 'warm';

const TONE_INSTRUCTIONS: Record<CoverLetterTone, string> = {
	professional: `Write in a formal, achievement-focused tone. Minimize personal flair. Use precise language and concrete results. Address the hiring manager respectfully.`,
	confident: `Write with strong, direct statements. Minimize softening language ("I believe", "I feel"). Lead with impact and outcomes. Show conviction in your value.`,
	warm: `Write with a storytelling approach. Build personal connection through narrative. Express genuine enthusiasm. Balance professionalism with personality.`,
};

const COVER_LETTER_BASE = `You are an expert cover letter writer. Generate a cover letter based on the candidate's resume and the job posting.

You MUST respond with ONLY valid JSON matching this schema (no markdown, no explanation):

{
  "hiringManager": "Name if known, otherwise 'Hiring Manager'",
  "opening": "Opening paragraph — hook + position reference",
  "body": ["Body paragraph 1", "Body paragraph 2", "Body paragraph 3 (optional)"],
  "closing": "Closing paragraph — call to action + thanks",
  "tone": "professional"
}

Rules:
- 2-3 body paragraphs maximum.
- Each paragraph should be 3-5 sentences.
- Reference specific experiences from the resume that match the job requirements.
- Do NOT repeat the resume verbatim — synthesize and connect to the role.
- Include a professional closing.`;

export function buildCoverLetterSystem(language: string): string {
	return `${COVER_LETTER_BASE}

Write the cover letter in ${languageLabel(language)}.
Apply ${languageLabel(language)}-market professional conventions for cover letters.
For German ("de"):
  - Use formal "Sie" address
  - Include: Betreff line, formal greeting (Sehr geehrte/r ...), Einleitung, Hauptteil, Schluss, formal closing (Mit freundlichen Grüßen)
  - Tone options: "professional" = sachlich, "confident" = selbstbewusst, "warm" = persönlich
For English ("en"):
  - Standard international cover letter format
  - Tone options as defined in the system prompt`;
}

export function buildCoverLetterPrompt(params: {
	tone: CoverLetterTone;
	resumeText: string;
	vacancyText: string;
	contactName: string;
	companyName: string;
	jobTitle: string;
}): string {
	return `Tone: ${params.tone}
${TONE_INSTRUCTIONS[params.tone]}

Candidate Name: ${params.contactName}
Company: ${params.companyName}
Position: ${params.jobTitle}

## Candidate's Resume

${params.resumeText}

## Job Posting

${params.vacancyText}

Generate a cover letter for this candidate applying to this position. Use the ${params.tone} tone.`;
}
