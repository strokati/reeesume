'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createAward, updateAward } from '@/server/actions/master-resume';
import { CreateAwardSchema, type CreateAwardInput } from '@/lib/validations/master-resume';
import type { Award } from '@prisma/client';

function AwardDialogForm({ resumeId, award, onOpenChange }: { resumeId: string; award?: Award | null; onOpenChange: (open: boolean) => void }) {
	const [isPending, startTransition] = useTransition();
	const isEdit = !!award;
	const form = useForm<CreateAwardInput>({
		resolver: zodResolver(CreateAwardSchema),
		values: { title: award?.title ?? '', issuer: award?.issuer ?? '', date: award?.date ?? '', description: award?.description ?? '' },
	});
	function onSubmit(data: CreateAwardInput) {
		startTransition(async () => {
			try {
				if (isEdit) { await updateAward(award.id, data); toast.success('Award updated'); }
				else { await createAward(resumeId, data); toast.success('Award added'); }
				onOpenChange(false);
			} catch { toast.error('Failed to save'); }
		});
	}
	const { register, handleSubmit, formState } = form;
	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-1.5">
				<Label htmlFor="award-title">Title *</Label>
				<Input id="award-title" {...register('title')} />
				{formState.errors.title && <p className="text-xs text-destructive">{formState.errors.title.message}</p>}
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-1.5"><Label htmlFor="award-issuer">Issuer</Label><Input id="award-issuer" {...register('issuer')} /></div>
				<div className="space-y-1.5"><Label htmlFor="award-date">Date</Label><Input id="award-date" {...register('date')} placeholder="Jun 2023" /></div>
			</div>
			<div className="space-y-1.5"><Label htmlFor="award-desc">Description</Label><Textarea id="award-desc" {...register('description')} rows={3} /></div>
			<div className="flex justify-end gap-2">
				<Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
				<Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : isEdit ? 'Update' : 'Add'}</Button>
			</div>
		</form>
	);
}

export function AwardDialog({ open, onOpenChange, resumeId, award }: { open: boolean; onOpenChange: (open: boolean) => void; resumeId: string; award?: Award | null }) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader><DialogTitle>{!!award ? 'Edit Award' : 'Add Award'}</DialogTitle></DialogHeader>
				{open && <AwardDialogForm key={award?.id ?? 'new'} resumeId={resumeId} award={award} onOpenChange={onOpenChange} />}
			</DialogContent>
		</Dialog>
	);
}
