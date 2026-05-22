'use client';

import { useState, useTransition } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { SectionCard } from './SectionCard';
import { CertificationCard } from './CertificationCard';
import { CertificationDialog } from './CertificationDialog';
import { reorderCertifications } from '@/server/actions/master-resume';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Certification } from '@prisma/client';

function SortableCertificationCard({ certification, resumeId }: { certification: Certification; resumeId: string }) {
	const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: certification.id });
	const style = { transform: CSS.Transform.toString(transform), transition };
	return (
		<div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : undefined}>
			<CertificationCard certification={certification} resumeId={resumeId} dragHandleProps={{ ...attributes, ref: setActivatorNodeRef, ...listeners }} />
		</div>
	);
}

export function CertificationSection({ certifications, resumeId }: { certifications: Certification[]; resumeId: string }) {
	const [addOpen, setAddOpen] = useState(false);
	const [, startTransition] = useTransition();
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const oldIndex = certifications.findIndex((c) => c.id === active.id);
		const newIndex = certifications.findIndex((c) => c.id === over.id);
		if (oldIndex === -1 || newIndex === -1) return;
		const reordered = [...certifications];
		const [moved] = reordered.splice(oldIndex, 1);
		reordered.splice(newIndex, 0, moved);
		startTransition(async () => {
			try { await reorderCertifications(resumeId, reordered.map((c) => c.id)); }
			catch { toast.error('Failed to reorder'); }
		});
	}

	return (
		<SectionCard title="Certifications" collapsible action={
			<Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
		}>
			{certifications.length === 0 ? (
				<p className="text-sm text-muted-foreground py-2">No certifications added yet.</p>
			) : (
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={certifications.map((c) => c.id)} strategy={verticalListSortingStrategy}>
						<div className="space-y-2">
							{certifications.map((c) => <SortableCertificationCard key={c.id} certification={c} resumeId={resumeId} />)}
						</div>
					</SortableContext>
				</DndContext>
			)}
			<CertificationDialog open={addOpen} onOpenChange={setAddOpen} resumeId={resumeId} />
		</SectionCard>
	);
}
