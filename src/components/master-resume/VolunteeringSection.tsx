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
import { VolunteeringCard } from './VolunteeringCard';
import { VolunteeringDialog } from './VolunteeringDialog';
import { reorderVolunteeringRoles } from '@/server/actions/master-resume';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { VolunteeringRole } from '@prisma/client';

function SortableVolunteeringCard({
  role,
  resumeId,
}: {
  role: VolunteeringRole;
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
  } = useSortable({ id: role.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : undefined}>
      <VolunteeringCard
        volunteeringRole={role}
        resumeId={resumeId}
        dragHandleProps={{ ...attributes, ref: setActivatorNodeRef, ...listeners }}
      />
    </div>
  );
}

export function VolunteeringSection({
  roles,
  resumeId,
}: {
  roles: VolunteeringRole[];
  resumeId: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = roles.findIndex((r) => r.id === active.id);
    const newIndex = roles.findIndex((r) => r.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...roles];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    startTransition(async () => {
      try {
        await reorderVolunteeringRoles(
          resumeId,
          reordered.map((r) => r.id)
        );
      } catch {
        toast.error('Failed to reorder');
      }
    });
  }

  return (
    <SectionCard
      title="Volunteering & Leadership"
      collapsible
      action={
        <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      }
    >
      {roles.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No volunteering roles added yet.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={roles.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {roles.map((r) => (
                <SortableVolunteeringCard key={r.id} role={r} resumeId={resumeId} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <VolunteeringDialog open={addOpen} onOpenChange={setAddOpen} resumeId={resumeId} />
    </SectionCard>
  );
}
