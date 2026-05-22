'use client';

import { useState, useRef, useTransition } from 'react';
import { toast } from 'sonner';
import { updateTargetTitle } from '@/server/actions/master-resume';
import { Input } from '@/components/ui/input';

export function TargetTitleForm({
	resumeId,
	defaultValue,
}: {
	resumeId: string;
	defaultValue?: string | null;
}) {
	const [value, setValue] = useState(defaultValue ?? '');
	const [isPending, startTransition] = useTransition();
	const inputRef = useRef<HTMLInputElement>(null);

	function save() {
		const trimmed = value.trim();
		if (trimmed === (defaultValue ?? '')) return;
		startTransition(async () => {
			try {
				await updateTargetTitle(resumeId, trimmed);
				toast.success('Target title saved');
			} catch {
				toast.error('Failed to save target title');
			}
		});
	}

	return (
		<Input
			ref={inputRef}
			value={value}
			onChange={(e) => setValue(e.target.value)}
			onBlur={save}
			onKeyDown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					inputRef.current?.blur();
				}
			}}
			placeholder="e.g. Senior Frontend Engineer"
			disabled={isPending}
			className="text-base"
		/>
	);
}
