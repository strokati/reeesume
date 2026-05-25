'use client';

import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

type Tone = 'professional' | 'confident' | 'warm';

const OPTIONS: { value: Tone; label: string; description: string }[] = [
	{ value: 'professional', label: 'Professional', description: 'Formal and achievement-focused' },
	{ value: 'confident', label: 'Confident & Direct', description: 'Bold, direct statements' },
	{ value: 'warm', label: 'Warm & Narrative', description: 'Storytelling and personal connection' },
];

export function ToneSelector({
	value,
	onChange,
}: {
	value: string;
	onChange: (tone: Tone) => void;
}) {
	return (
		<div className="flex items-center gap-1">
			{OPTIONS.map((opt) => (
				<Tooltip key={opt.value}>
					<TooltipTrigger>
						<Button
							variant={value === opt.value ? 'default' : 'outline'}
							size="sm"
							className="h-7 text-xs"
							onClick={() => onChange(opt.value)}
						>
							{opt.label}
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom" className="text-xs">
						{opt.description}
					</TooltipContent>
				</Tooltip>
			))}
		</div>
	);
}
