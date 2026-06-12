'use client';

import { useState, useTransition } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { SectionCard } from './SectionCard';
import { EducationCard } from './EducationCard';
import { EducationDialog } from './EducationDialog';
import { reorderEducation } from '@/server/actions/master-resume';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Education } from '@/generated/prisma/client';

function SortableEducationCard({
  education,
  resumeId,
}: {
  education: Education;
  resumeId: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: education.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : undefined}>
      <EducationCard
        education={education}
        resumeId={resumeId}
        dragHandleProps={{ ...attributes, ref: setActivatorNodeRef, ...listeners }}
      />
    </div>
  );
}

export function EducationSection({
  education,
  resumeId,
}: {
  education: Education[];
  resumeId: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = education.findIndex((e) => e.id === active.id);
    const newIndex = education.findIndex((e) => e.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...education];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    startTransition(async () => {
      try {
        await reorderEducation(
          resumeId,
          reordered.map((e) => e.id)
        );
      } catch {
        toast.error('Failed to reorder');
      }
    });
  }

  return (
    <SectionCard
      title="Education"
      collapsible
      action={
        <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Education
        </Button>
      }
    >
      {education.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No education added yet.</p>
      ) : (
        <DndContext
          id="education-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={education.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {education.map((edu) => (
                <SortableEducationCard key={edu.id} education={edu} resumeId={resumeId} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <EducationDialog open={addOpen} onOpenChange={setAddOpen} resumeId={resumeId} />
    </SectionCard>
  );
}
