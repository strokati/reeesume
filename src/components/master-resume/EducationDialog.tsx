'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createEducation, updateEducation } from '@/server/actions/master-resume';
import { CreateEducationSchema, type CreateEducationInput } from '@/lib/validations/master-resume';
import type { Education } from '@/generated/prisma/client';
import { X, Plus } from 'lucide-react';

function ActivitiesEditor({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [newItem, setNewItem] = useState('');
  return (
    <div className="space-y-2">
      <Label>Activities</Label>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <Input
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              <X className="h-3 w-3" />
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex gap-1">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (newItem.trim()) {
                onChange([...items, newItem.trim()]);
                setNewItem('');
              }
            }
          }}
          placeholder="Add activity..."
          className="text-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            if (newItem.trim()) {
              onChange([...items, newItem.trim()]);
              setNewItem('');
            }
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function EducationDialogForm({
  resumeId,
  education,
  onOpenChange,
}: {
  resumeId: string;
  education?: Education | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!education;

  const [activities, setActivities] = useState<string[]>(
    (education?.activities as string[] | null) ?? []
  );

  const form = useForm<Omit<CreateEducationInput, 'activities'>>({
    resolver: zodResolver(CreateEducationSchema.omit({ activities: true })),
    values: {
      institution: education?.institution ?? '',
      degree: education?.degree ?? '',
      field: education?.field ?? '',
      location: education?.location ?? '',
      startDate: education?.startDate ?? '',
      endDate: education?.endDate ?? '',
      gpa: education?.gpa ?? '',
      honors: education?.honors ?? '',
    },
  });

  function onSubmit(data: Omit<CreateEducationInput, 'activities'>) {
    const payload: CreateEducationInput = {
      ...data,
      activities: activities.filter((s) => s.trim()),
    };
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateEducation(education.id, payload);
          toast.success('Education updated');
        } else {
          await createEducation(resumeId, payload);
          toast.success('Education added');
        }
        onOpenChange(false);
      } catch {
        toast.error('Failed to save education');
      }
    });
  }

  const { register, handleSubmit, formState } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="edu-inst">Institution *</Label>
        <Input id="edu-inst" {...register('institution')} />
        {formState.errors.institution && (
          <p className="text-xs text-destructive">{formState.errors.institution.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="edu-degree">Degree</Label>
          <Input id="edu-degree" {...register('degree')} placeholder="Master of Science" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edu-field">Field</Label>
          <Input id="edu-field" {...register('field')} placeholder="Computer Science" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="edu-loc">Location</Label>
          <Input id="edu-loc" {...register('location')} placeholder="City, Country" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edu-gpa">GPA</Label>
          <Input id="edu-gpa" {...register('gpa')} placeholder="3.8/4.0" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="edu-start">Start Date</Label>
          <Input id="edu-start" {...register('startDate')} placeholder="Sep 2018" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edu-end">End Date</Label>
          <Input id="edu-end" {...register('endDate')} placeholder="Jun 2020" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edu-honors">Honors</Label>
        <Input id="edu-honors" {...register('honors')} placeholder="Magna Cum Laude" />
      </div>

      <ActivitiesEditor items={activities} onChange={setActivities} />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : isEdit ? 'Update' : 'Add'}
        </Button>
      </div>
    </form>
  );
}

export function EducationDialog({
  open,
  onOpenChange,
  resumeId,
  education,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  education?: Education | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{!!education ? 'Edit Education' : 'Add Education'}</DialogTitle>
        </DialogHeader>
        {open && (
          <EducationDialogForm
            key={education?.id ?? 'new'}
            resumeId={resumeId}
            education={education}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
