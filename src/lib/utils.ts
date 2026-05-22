import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
	if (!date) return 'Present';
	return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
