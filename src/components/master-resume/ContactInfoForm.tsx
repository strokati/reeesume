'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { updateContactInfo } from '@/server/actions/master-resume';
import { ContactInfoSchema, type ContactInfoInput } from '@/lib/validations/master-resume';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const fields: { name: keyof ContactInfoInput; label: string; type?: string }[] = [
	{ name: 'name', label: 'Full Name' },
	{ name: 'email', label: 'Email', type: 'email' },
	{ name: 'phone', label: 'Phone', type: 'tel' },
	{ name: 'location', label: 'Location (City, Country)' },
	{ name: 'linkedin', label: 'LinkedIn URL', type: 'url' },
	{ name: 'github', label: 'GitHub URL', type: 'url' },
	{ name: 'website', label: 'Personal Website', type: 'url' },
];

export function ContactInfoForm({
	resumeId,
	defaultValues,
}: {
	resumeId: string;
	defaultValues?: ContactInfoInput;
}) {
	const [isPending, startTransition] = useTransition();

	const form = useForm<ContactInfoInput>({
		resolver: zodResolver(ContactInfoSchema),
		defaultValues: defaultValues ?? { name: '', email: '', phone: '', location: '' },
	});

	function onSubmit(data: ContactInfoInput) {
		startTransition(async () => {
			try {
				await updateContactInfo(resumeId, data);
				toast.success('Contact info saved');
			} catch {
				toast.error('Failed to save contact info');
			}
		});
	}

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2">
				{fields.map(({ name, label, type }) => (
					<div key={name} className="space-y-1.5">
						<Label htmlFor={name}>{label}</Label>
						<Input id={name} type={type ?? 'text'} {...form.register(name)} />
					</div>
				))}
			</div>
			<div className="flex justify-end">
				<Button type="submit" disabled={isPending}>
					{isPending ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</form>
	);
}
