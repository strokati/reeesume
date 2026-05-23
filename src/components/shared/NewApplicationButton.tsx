'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewApplicationDialog } from './NewApplicationDialog';

export function NewApplicationButton() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>
				<Plus className="h-4 w-4 mr-1.5" />
				New Application
			</Button>
			<NewApplicationDialog open={open} onOpenChange={setOpen} />
		</>
	);
}
