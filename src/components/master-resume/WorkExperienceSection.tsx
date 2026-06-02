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
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { SectionCard } from './SectionCard';
import { WorkCompanyCard } from './WorkCompanyCard';
import { WorkRoleWithCompanyDialog } from './WorkRoleWithCompanyDialog';
import { reorderWorkCompanies } from '@/server/actions/master-resume';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { WorkCompanyWithRoles } from '@/types/master-resume';

export function WorkExperienceSection({
  companies,
  resumeId,
}: {
  companies: WorkCompanyWithRoles[];
  resumeId: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = companies.findIndex((c) => c.id === active.id);
    const newIndex = companies.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...companies];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    startTransition(async () => {
      try {
        await reorderWorkCompanies(
          resumeId,
          reordered.map((c) => c.id)
        );
      } catch {
        toast.error('Failed to reorder');
      }
    });
  }

  return (
    <SectionCard
      title="Work Experience"
      collapsible
      action={
        <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Role
        </Button>
      }
    >
      {companies.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No work experience added yet.</p>
      ) : (
        <DndContext
          id="work-experience-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={companies.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {companies.map((company) => (
                <WorkCompanyCard key={company.id} company={company} resumeId={resumeId} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <WorkRoleWithCompanyDialog open={addOpen} onOpenChange={setAddOpen} resumeId={resumeId} />
    </SectionCard>
  );
}
