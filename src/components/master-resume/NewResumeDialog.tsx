'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createMasterResume } from '@/server/actions/master-resume';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const LANGUAGES = [
	{ code: 'en', label: 'English', flag: '\u{1F1EC}\u{1F1E7}' },
	{ code: 'de', label: 'German', flag: '\u{1F1E9}\u{1F1EA}' },
	{ code: 'fr', label: 'French', flag: '\u{1F1EB}\u{1F1F7}' },
	{ code: 'es', label: 'Spanish', flag: '\u{1F1EA}\u{1F1F8}' },
	{ code: 'it', label: 'Italian', flag: '\u{1F1EE}\u{1F1F9}' },
	{ code: 'nl', label: 'Dutch', flag: '\u{1F1F3}\u{1F1F1}' },
	{ code: 'pl', label: 'Polish', flag: '\u{1F1F5}\u{1F1F1}' },
	{ code: 'other', label: 'Other', flag: '\u{1F310}' },
];

const schema = z.object({
	name: z.string().min(1, 'Name is required').max(60),
	language: z.string().min(2, 'Language is required').max(10),
	languageCode: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function NewResumeDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { name: '', language: 'en', languageCode: '' },
	});

	const selectedLanguage = watch('language');

	async function onSubmit(data: FormValues) {
		const language = data.language === 'other' ? data.languageCode ?? '' : data.language;
		if (data.language === 'other' && (!language || language.length < 2)) {
			toast.error('Please enter a valid language code.');
			return;
		}

		setSubmitting(true);
		try {
			const result = await createMasterResume({ name: data.name, language });
			toast.success('Master resume created.');
			reset();
			onOpenChange(false);
			router.push(`/master-resume/${result.id}`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Failed to create resume.');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>New Master Resume</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="resume-name">Name</Label>
						<Input
							id="resume-name"
							placeholder="e.g. German Market"
							maxLength={60}
							{...register('name')}
						/>
						{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
					</div>
					<div className="space-y-2">
						<Label>Language</Label>
						<Select value={selectedLanguage} onValueChange={(v) => v && setValue('language', v)}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select language" />
							</SelectTrigger>
							<SelectContent>
								{LANGUAGES.map((l) => (
									<SelectItem key={l.code} value={l.code}>
										{l.flag} {l.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					{selectedLanguage === 'other' && (
						<div className="space-y-2">
							<Label htmlFor="lang-code">Language Code</Label>
							<Input
								id="lang-code"
								placeholder="e.g. uk, pt, sv"
								maxLength={10}
								{...register('languageCode')}
							/>
						</div>
					)}
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? 'Creating...' : 'Create'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
