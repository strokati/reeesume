'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { updateApplicationResume } from '@/server/actions/applications';
import type { MasterResumeSummary } from '@/types/master-resume';

export function ChangeResumeDialog({
	applicationId,
	resumes,
	currentResumeId,
	hasDrafts,
	open,
	onOpenChange,
}: {
	applicationId: string;
	resumes: MasterResumeSummary[];
	currentResumeId: string | null;
	hasDrafts: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [selectedId, setSelectedId] = useState(currentResumeId ?? '');
	const [isPending, startTransition] = useTransition();

	const currentDefault = resumes.find((r) => r.isDefault)?.id ?? resumes[0]?.id ?? '';

	function handleSubmit() {
		startTransition(async () => {
			try {
				await updateApplicationResume(applicationId, selectedId || currentDefault);
				toast.success('Source resume updated');
				onOpenChange(false);
			} catch {
				toast.error('Failed to update source resume');
			}
		});
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Change Source Resume</DialogTitle>
					<DialogDescription>
						Select which master resume to use as the source for this application.
					</DialogDescription>
				</DialogHeader>

				{hasDrafts && (
					<div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
						<AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
						<span>
							Changing the source resume won&apos;t update existing resume drafts.
							Only new drafts will use the new source.
						</span>
					</div>
				)}

				<div className="space-y-1.5">
					<Label>Source Resume</Label>
					<Select value={selectedId} onValueChange={(v) => setSelectedId(v ?? '')}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select resume" />
						</SelectTrigger>
						<SelectContent>
							{resumes.map((r) => (
								<SelectItem key={r.id} value={r.id} label={`${r.name} (${r.language.toUpperCase()})`}>
									{r.name} ({r.language.toUpperCase()}){r.isDefault ? ' — Default' : ''}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex justify-end gap-2">
					<Button variant="ghost" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isPending}>
						{isPending ? 'Saving...' : 'Save'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
