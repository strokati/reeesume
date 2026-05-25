import crypto from 'crypto';
import type { ResumeData } from '@/lib/templates/types';

interface RenderEntry {
	type: 'resume' | 'resume-with-cover';
	data: ResumeData;
	templateId: string;
	coverLetterHtml?: string;
	expiresAt: number;
}

const globalForStore = globalThis as unknown as { __renderStore: Map<string, RenderEntry> };
const store = globalForStore.__renderStore ??= new Map<string, RenderEntry>();

export function storeRenderData(
	data: ResumeData,
	templateId: string,
	coverLetterHtml?: string,
): string {
	const token = crypto.randomUUID();
	store.set(token, {
		type: coverLetterHtml ? 'resume-with-cover' : 'resume',
		data,
		templateId,
		coverLetterHtml,
		expiresAt: Date.now() + 60_000,
	});
	return token;
}

export function consumeRenderData(token: string): RenderEntry | null {
	const entry = store.get(token);
	if (!entry || entry.expiresAt < Date.now()) {
		store.delete(token);
		return null;
	}
	store.delete(token);
	return entry;
}
