'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deleteVolunteeringRole } from '@/server/actions/master-resume';
import { VolunteeringDialog } from './VolunteeringDialog';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import type { VolunteeringRole } from '@prisma/client';

export function VolunteeringCard({ volunteeringRole, resumeId, dragHandleProps }: {
	volunteeringRole: VolunteeringRole; resumeId: string; dragHandleProps?: Record<string, unknown>;
}) {
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		startTransition(async () => {
			try { await deleteVolunteeringRole(volunteeringRole.id); toast.success('Deleted'); }
			catch { toast.error('Failed to delete'); }
		});
	}

	const responsibilities = (volunteeringRole.responsibilities as string[] | null) ?? [];
	const dateRange = [volunteeringRole.startDate, volunteeringRole.endDate ?? 'Current'].filter(Boolean).join(' – ');

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
					<div className="flex items-center gap-2 min-w-0">
						{dragHandleProps && <span {...dragHandleProps} className="cursor-grab touch-none text-muted-foreground hover:text-foreground"><GripVertical className="h-4 w-4" /></span>}
						<span className="font-medium truncate">{volunteeringRole.organization}</span>
						{volunteeringRole.role && <span className="text-sm text-muted-foreground truncate">{volunteeringRole.role}</span>}
						{(dateRange || volunteeringRole.location) && (
							<span className="text-xs text-muted-foreground">
								{[volunteeringRole.location, dateRange].filter(Boolean).join(' · ')}
							</span>
						)}
					</div>
					<div className="flex items-center gap-1 shrink-0">
						<Button variant="ghost" size="icon-sm" onClick={() => setEditOpen(true)}><Pencil className="h-3 w-3" /></Button>
						{confirmDelete ? (
							<><Button variant="destructive" size="xs" onClick={handleDelete} disabled={isPending}>Yes</Button><Button variant="ghost" size="xs" onClick={() => setConfirmDelete(false)}>No</Button></>
						) : (
							<Button variant="ghost" size="icon-sm" onClick={() => setConfirmDelete(true)}><Trash2 className="h-3 w-3" /></Button>
						)}
					</div>
				</CardHeader>
				{responsibilities.length > 0 && (
					<CardContent className="px-3 pb-3 pt-0">
						<ul className="list-disc pl-4 space-y-0.5 text-sm">
							{responsibilities.map((r, i) => <li key={i}>{r}</li>)}
						</ul>
					</CardContent>
				)}
			</Card>
			<VolunteeringDialog open={editOpen} onOpenChange={setEditOpen} resumeId={resumeId} role={volunteeringRole} />
		</>
	);
}
