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
import { ProjectCard } from './ProjectCard';
import { ProjectDialog } from './ProjectDialog';
import { reorderProjects } from '@/server/actions/master-resume';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Project } from '@/generated/prisma/client';

function SortableProjectCard({ project, resumeId }: { project: Project; resumeId: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : undefined}>
      <ProjectCard
        project={project}
        resumeId={resumeId}
        dragHandleProps={{ ...attributes, ref: setActivatorNodeRef, ...listeners }}
      />
    </div>
  );
}

export function ProjectSection({ projects, resumeId }: { projects: Project[]; resumeId: string }) {
  const [addOpen, setAddOpen] = useState(false);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...projects];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    startTransition(async () => {
      try {
        await reorderProjects(
          resumeId,
          reordered.map((p) => p.id)
        );
      } catch {
        toast.error('Failed to reorder');
      }
    });
  }

  return (
    <SectionCard
      title="Projects"
      collapsible
      action={
        <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      }
    >
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No projects added yet.</p>
      ) : (
        <DndContext
          id="project-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {projects.map((p) => (
                <SortableProjectCard key={p.id} project={p} resumeId={resumeId} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <ProjectDialog open={addOpen} onOpenChange={setAddOpen} resumeId={resumeId} />
    </SectionCard>
  );
}
