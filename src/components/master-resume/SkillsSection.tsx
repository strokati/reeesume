'use client';

import { useState, useTransition, useMemo } from 'react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionCard } from './SectionCard';
import { SkillLevelSelect, levelColor } from './SkillLevelSelect';
import {
  createSkill,
  updateSkill,
  deleteSkill,
  reorderSkills,
} from '@/server/actions/master-resume';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Skill } from '@prisma/client';

function SortableSkillBadge({ skill }: { skill: Skill }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(skill.name);
  const [isPending, startTransition] = useTransition();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: skill.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  function save() {
    if (!name.trim()) return;
    setEditing(false);
    if (name === skill.name) return;
    startTransition(async () => {
      try {
        await updateSkill(skill.id, { name: name.trim() });
      } catch {
        toast.error('Failed to update skill');
      }
    });
  }

  function handleLevelChange(level: string | null) {
    startTransition(async () => {
      try {
        await updateSkill(skill.id, { level: level as 'Beginner' | 'Intermediate' | 'Expert' });
      } catch {
        toast.error('Failed to update level');
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteSkill(skill.id);
      } catch {
        toast.error('Failed to delete skill');
      }
    });
  }

  if (editing) {
    return (
      <span ref={setNodeRef} style={style} className="inline-flex items-center gap-1">
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              save();
            }
          }}
          className="h-7 w-28 text-xs"
        />
      </span>
    );
  }

  return (
    <span
      ref={setNodeRef}
      style={style}
      className={cn('inline-flex items-center gap-1', isDragging && 'opacity-50')}
      {...attributes}
      {...listeners}
    >
      <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setEditing(true)}>
        <span className={cn('h-1.5 w-1.5 rounded-full', levelColor(skill.level))} />
        {skill.name}
      </Badge>
      <SkillLevelSelect value={skill.level} onChange={handleLevelChange} />
      <button
        type="button"
        onClick={handleDelete}
        className="text-muted-foreground hover:text-destructive"
        disabled={isPending}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function SkillCategory({
  category,
  skills,
  resumeId,
}: {
  category: string;
  skills: Skill[];
  resumeId: string;
}) {
  const [newSkill, setNewSkill] = useState('');
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = skills.findIndex((s) => s.id === active.id);
    const newIndex = skills.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...skills];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    startTransition(async () => {
      try {
        await reorderSkills(
          resumeId,
          reordered.map((s) => s.id)
        );
      } catch {
        toast.error('Failed to reorder');
      }
    });
  }

  function addSkill() {
    const name = newSkill.trim();
    if (!name) return;
    startTransition(async () => {
      try {
        await createSkill(resumeId, {
          name,
          category: category === 'Other' ? undefined : category,
        });
        setNewSkill('');
      } catch {
        toast.error('Failed to add skill');
      }
    });
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{category}</Label>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={skills.map((s) => s.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap items-center gap-2">
            {skills.map((skill) => (
              <SortableSkillBadge key={skill.id} skill={skill} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex items-center gap-1">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder="Add skill..."
          className="h-8 w-40 text-xs"
          disabled={isPending}
        />
      </div>
    </div>
  );
}

export function SkillsSection({ skills, resumeId }: { skills: Skill[]; resumeId: string }) {
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [showCategoryInput, setShowCategoryInput] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, Skill[]>();
    for (const skill of skills) {
      const cat = skill.category || 'Other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(skill);
    }
    return map;
  }, [skills]);

  const allCategories = useMemo(() => {
    const existing = Array.from(grouped.keys());
    for (const cat of customCategories) {
      if (!existing.includes(cat)) existing.push(cat);
    }
    return existing;
  }, [grouped, customCategories]);

  function addCategory() {
    const name = newCategory.trim();
    if (!name || allCategories.includes(name)) return;
    setCustomCategories((prev) => [...prev, name]);
    setNewCategory('');
    setShowCategoryInput(false);
  }

  return (
    <SectionCard title="Skills & Interests" collapsible>
      <div className="space-y-4">
        {allCategories.map((cat) => (
          <SkillCategory
            key={cat}
            category={cat}
            skills={grouped.get(cat) ?? []}
            resumeId={resumeId}
          />
        ))}

        {showCategoryInput ? (
          <div className="flex items-center gap-1">
            <Input
              autoFocus
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCategory();
                }
              }}
              onBlur={() => {
                if (!newCategory.trim()) setShowCategoryInput(false);
              }}
              placeholder="Category name..."
              className="h-8 w-44 text-xs"
            />
            <Button variant="ghost" size="icon-sm" onClick={addCategory}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="xs" onClick={() => setShowCategoryInput(true)}>
            <Plus className="h-3 w-3 mr-1" /> Add Category
          </Button>
        )}
      </div>
    </SectionCard>
  );
}
