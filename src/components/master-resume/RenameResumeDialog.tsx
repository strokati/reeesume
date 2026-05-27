'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { renameMasterResume } from '@/server/actions/master-resume';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const schema = z.object({
	name: z.string().min(1, 'Name is required').max(60),
});

type FormValues = z.infer<typeof schema>;

export function RenameResumeDialog({
	resumeId,
	currentName,
	open,
	onOpenChange,
}: {
	resumeId: string;
	currentName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { name: currentName },
	});

	async function onSubmit(data: FormValues) {
		setSubmitting(true);
		try {
			await renameMasterResume(resumeId, data.name);
			toast.success('Resume renamed.');
			onOpenChange(false);
			router.refresh();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Failed to rename resume.');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Rename Resume</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="rename-input">Name</Label>
						<Input id="rename-input" maxLength={60} {...register('name')} />
						{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? 'Saving...' : 'Save'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
