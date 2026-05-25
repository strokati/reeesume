'use client';

import { useTransition } from 'react';
import { Check, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { updateResumeDraftTemplate } from '@/server/actions/resume-drafts';
import { toast } from 'sonner';

const TEMPLATES = [
	{ id: 'ats-simple', name: 'ATS Simple', description: 'Single-column, max ATS compatibility' },
	{ id: 'professional-classic', name: 'Professional Classic', description: 'Two-column, subtle formatting' },
	{ id: 'modern-minimal', name: 'Modern Minimal', description: 'Contemporary with accent color' },
	{ id: 'international-de', name: 'International / German', description: 'DE/AT/CH conventions, photo slot' },
];

export function TemplatePicker({
	draftId,
	currentTemplateId,
}: {
	draftId: string;
	currentTemplateId: string;
}) {
	const [, startTransition] = useTransition();

	function handleSelect(templateId: string) {
		if (templateId === currentTemplateId) return;
		startTransition(async () => {
			try {
				await updateResumeDraftTemplate(draftId, templateId);
				toast.success('Template updated');
			} catch {
				toast.error('Failed to update template');
			}
		});
	}

	const current = TEMPLATES.find((t) => t.id === currentTemplateId);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button variant="outline" size="sm">
					<Layout className="h-4 w-4 mr-1.5" />
					{current?.name ?? 'Template'}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64">
				{TEMPLATES.map((t) => (
					<DropdownMenuItem
						key={t.id}
						onClick={() => handleSelect(t.id)}
						className="flex items-start justify-between"
					>
						<div>
							<p className="text-sm font-medium">{t.name}</p>
							<p className="text-xs text-muted-foreground">{t.description}</p>
						</div>
						{t.id === currentTemplateId && (
							<Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
