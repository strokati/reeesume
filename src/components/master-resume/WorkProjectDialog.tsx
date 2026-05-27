'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { createWorkProject, updateWorkProject } from '@/server/actions/master-resume';
import {
  CreateWorkProjectSchema,
  type CreateWorkProjectInput,
} from '@/lib/validations/master-resume';
import type { WorkCompanyWithRoles } from '@/types/master-resume';
import { X } from 'lucide-react';

type WorkProject = WorkCompanyWithRoles['roles'][number]['projects'][number];

function WorkProjectDialogForm({
  roleId,
  project,
  onOpenChange,
}: {
  roleId: string;
  project?: WorkProject | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!project;

  const [technologies, setTechnologies] = useState<string[]>(
    (project?.technologies as string[] | null) ?? []
  );
  const [tagInput, setTagInput] = useState('');

  const form = useForm<Omit<CreateWorkProjectInput, 'technologies'>>({
    resolver: zodResolver(CreateWorkProjectSchema.omit({ technologies: true })),
    values: {
      name: project?.name ?? '',
      startDate: project?.startDate ?? '',
      endDate: project?.endDate ?? '',
      description: project?.description ?? '',
      contribution: project?.contribution ?? '',
      outcome: project?.outcome ?? '',
    },
  });

  function onSubmit(data: Omit<CreateWorkProjectInput, 'technologies'>) {
    const payload: CreateWorkProjectInput = { ...data, technologies };
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateWorkProject(project.id, payload);
          toast.success('Project updated');
        } else {
          await createWorkProject(roleId, payload);
          toast.success('Project added');
        }
        onOpenChange(false);
      } catch {
        toast.error('Failed to save project');
      }
    });
  }

  const { register, handleSubmit, formState } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="proj-name">Project Name *</Label>
        <Input id="proj-name" {...register('name')} />
        {formState.errors.name && (
          <p className="text-xs text-destructive">{formState.errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="proj-start">Start Date</Label>
          <Input id="proj-start" {...register('startDate')} placeholder="Jan 2020" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="proj-end">End Date</Label>
          <Input id="proj-end" {...register('endDate')} placeholder="Dec 2022" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proj-desc">Description</Label>
        <Textarea id="proj-desc" {...register('description')} rows={3} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proj-contrib">Contribution</Label>
        <Input id="proj-contrib" {...register('contribution')} />
      </div>

      <div className="space-y-2">
        <Label>Technologies</Label>
        <div className="flex flex-wrap gap-1">
          {technologies.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => setTechnologies(technologies.filter((t) => t !== tag))}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const tag = tagInput.trim();
              if (tag && !technologies.includes(tag)) {
                setTechnologies([...technologies, tag]);
                setTagInput('');
              }
            }
          }}
          placeholder="Type and press Enter..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proj-outcome">Outcome</Label>
        <Input id="proj-outcome" {...register('outcome')} />
      </div>

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

export function WorkProjectDialog({
  open,
  onOpenChange,
  roleId,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string;
  project?: WorkProject | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{!!project ? 'Edit Project' : 'Add Project'}</DialogTitle>
        </DialogHeader>
        {open && (
          <WorkProjectDialogForm
            key={project?.id ?? 'new'}
            roleId={roleId}
            project={project}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
