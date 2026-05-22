'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCertification, updateCertification } from '@/server/actions/master-resume';
import { CreateCertificationSchema, type CreateCertificationInput } from '@/lib/validations/master-resume';
import type { Certification } from '@prisma/client';

function CertificationDialogForm({
	resumeId,
	certification,
	onOpenChange,
}: {
	resumeId: string;
	certification?: Certification | null;
	onOpenChange: (open: boolean) => void;
}) {
	const [isPending, startTransition] = useTransition();
	const isEdit = !!certification;

	const form = useForm<CreateCertificationInput>({
		resolver: zodResolver(CreateCertificationSchema),
		values: {
			name: certification?.name ?? '',
			issuer: certification?.issuer ?? '',
			issueDate: certification?.issueDate ?? '',
			expiryDate: certification?.expiryDate ?? '',
			credentialId: certification?.credentialId ?? '',
			url: certification?.url ?? '',
		},
	});

	function onSubmit(data: CreateCertificationInput) {
		startTransition(async () => {
			try {
				if (isEdit) {
					await updateCertification(certification.id, data);
					toast.success('Certification updated');
				} else {
					await createCertification(resumeId, data);
					toast.success('Certification added');
				}
				onOpenChange(false);
			} catch {
				toast.error('Failed to save certification');
			}
		});
	}

	const { register, handleSubmit, formState } = form;

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-1.5">
				<Label htmlFor="cert-name">Name *</Label>
				<Input id="cert-name" {...register('name')} />
				{formState.errors.name && <p className="text-xs text-destructive">{formState.errors.name.message}</p>}
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="cert-issuer">Issuer</Label>
					<Input id="cert-issuer" {...register('issuer')} />
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="cert-cred">Credential ID</Label>
					<Input id="cert-cred" {...register('credentialId')} />
				</div>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="cert-issued">Issue Date</Label>
					<Input id="cert-issued" {...register('issueDate')} placeholder="Jan 2023" />
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="cert-expiry">Expiry Date</Label>
					<Input id="cert-expiry" {...register('expiryDate')} placeholder="Dec 2025" />
				</div>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor="cert-url">URL</Label>
				<Input id="cert-url" {...register('url')} placeholder="https://..." />
			</div>
			<div className="flex justify-end gap-2">
				<Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
				<Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : isEdit ? 'Update' : 'Add'}</Button>
			</div>
		</form>
	);
}

export function CertificationDialog({ open, onOpenChange, resumeId, certification }: {
	open: boolean; onOpenChange: (open: boolean) => void; resumeId: string; certification?: Certification | null;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader><DialogTitle>{!!certification ? 'Edit Certification' : 'Add Certification'}</DialogTitle></DialogHeader>
				{open && <CertificationDialogForm key={certification?.id ?? 'new'} resumeId={resumeId} certification={certification} onOpenChange={onOpenChange} />}
			</DialogContent>
		</Dialog>
	);
}
