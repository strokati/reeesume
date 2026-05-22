'use client';

import { useState, useTransition } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { SectionCard } from './SectionCard';
import { PublicationCard } from './PublicationCard';
import { PublicationDialog } from './PublicationDialog';
import { reorderPublications } from '@/server/actions/master-resume';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Publication } from '@prisma/client';

function SortablePublicationCard({ publication, resumeId }: { publication: Publication; resumeId: string }) {
	const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: publication.id });
	const style = { transform: CSS.Transform.toString(transform), transition };
	return (
		<div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : undefined}>
			<PublicationCard publication={publication} resumeId={resumeId} dragHandleProps={{ ...attributes, ref: setActivatorNodeRef, ...listeners }} />
		</div>
	);
}

export function PublicationSection({ publications, resumeId }: { publications: Publication[]; resumeId: string }) {
	const [addOpen, setAddOpen] = useState(false);
	const [, startTransition] = useTransition();
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const oldIndex = publications.findIndex((p) => p.id === active.id);
		const newIndex = publications.findIndex((p) => p.id === over.id);
		if (oldIndex === -1 || newIndex === -1) return;
		const reordered = [...publications];
		const [moved] = reordered.splice(oldIndex, 1);
		reordered.splice(newIndex, 0, moved);
		startTransition(async () => {
			try { await reorderPublications(resumeId, reordered.map((p) => p.id)); }
			catch { toast.error('Failed to reorder'); }
		});
	}

	return (
		<SectionCard title="Publications" collapsible action={
			<Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
		}>
			{publications.length === 0 ? (
				<p className="text-sm text-muted-foreground py-2">No publications added yet.</p>
			) : (
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={publications.map((p) => p.id)} strategy={verticalListSortingStrategy}>
						<div className="space-y-2">
							{publications.map((p) => <SortablePublicationCard key={p.id} publication={p} resumeId={resumeId} />)}
						</div>
					</SortableContext>
				</DndContext>
			)}
			<PublicationDialog open={addOpen} onOpenChange={setAddOpen} resumeId={resumeId} />
		</SectionCard>
	);
}
