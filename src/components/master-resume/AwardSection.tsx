'use client';

import { useState, useTransition } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { SectionCard } from './SectionCard';
import { AwardCard } from './AwardCard';
import { AwardDialog } from './AwardDialog';
import { reorderAwards } from '@/server/actions/master-resume';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Award } from '@prisma/client';

function SortableAwardCard({ award, resumeId }: { award: Award; resumeId: string }) {
	const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: award.id });
	const style = { transform: CSS.Transform.toString(transform), transition };
	return (
		<div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : undefined}>
			<AwardCard award={award} resumeId={resumeId} dragHandleProps={{ ...attributes, ref: setActivatorNodeRef, ...listeners }} />
		</div>
	);
}

export function AwardSection({ awards, resumeId }: { awards: Award[]; resumeId: string }) {
	const [addOpen, setAddOpen] = useState(false);
	const [, startTransition] = useTransition();
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const oldIndex = awards.findIndex((a) => a.id === active.id);
		const newIndex = awards.findIndex((a) => a.id === over.id);
		if (oldIndex === -1 || newIndex === -1) return;
		const reordered = [...awards];
		const [moved] = reordered.splice(oldIndex, 1);
		reordered.splice(newIndex, 0, moved);
		startTransition(async () => {
			try { await reorderAwards(resumeId, reordered.map((a) => a.id)); }
			catch { toast.error('Failed to reorder'); }
		});
	}

	return (
		<SectionCard title="Awards & Scholarships" collapsible action={
			<Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
		}>
			{awards.length === 0 ? (
				<p className="text-sm text-muted-foreground py-2">No awards added yet.</p>
			) : (
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={awards.map((a) => a.id)} strategy={verticalListSortingStrategy}>
						<div className="space-y-2">
							{awards.map((a) => <SortableAwardCard key={a.id} award={a} resumeId={resumeId} />)}
						</div>
					</SortableContext>
				</DndContext>
			)}
			<AwardDialog open={addOpen} onOpenChange={setAddOpen} resumeId={resumeId} />
		</SectionCard>
	);
}
