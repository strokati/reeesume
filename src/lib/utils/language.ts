export const LANGUAGE_OPTIONS = [
	{ code: 'en', label: 'English', flag: '🇬🇧' },
	{ code: 'de', label: 'German', flag: '🇩🇪' },
	{ code: 'fr', label: 'French', flag: '🇫🇷' },
	{ code: 'es', label: 'Spanish', flag: '🇪🇸' },
	{ code: 'it', label: 'Italian', flag: '🇮🇹' },
	{ code: 'nl', label: 'Dutch', flag: '🇳🇱' },
	{ code: 'pl', label: 'Polish', flag: '🇵🇱' },
] as const;

export function languageLabel(code: string): string {
	return LANGUAGE_OPTIONS.find((l) => l.code === code)?.label ?? code;
}

export function languageFlag(code: string): string {
	return LANGUAGE_OPTIONS.find((l) => l.code === code)?.flag ?? '🌐';
}
