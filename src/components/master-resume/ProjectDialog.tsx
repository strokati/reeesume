'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createProject, updateProject } from '@/server/actions/master-resume';
import { CreateProjectSchema, type CreateProjectInput } from '@/lib/validations/master-resume';
import type { Project } from '@/generated/prisma/client';
import { X } from 'lucide-react';

function ProjectDialogForm({
  resumeId,
  project,
  onOpenChange,
}: {
  resumeId: string;
  project?: Project | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!project;
  const [technologies, setTechnologies] = useState<string[]>(
    (project?.technologies as string[] | null) ?? []
  );
  const [tagInput, setTagInput] = useState('');

  const form = useForm<Omit<CreateProjectInput, 'technologies'>>({
    resolver: zodResolver(CreateProjectSchema.omit({ technologies: true })),
    values: {
      name: project?.name ?? '',
      role: project?.role ?? '',
      startDate: project?.startDate ?? '',
      endDate: project?.endDate ?? '',
      description: project?.description ?? '',
      url: project?.url ?? '',
      repoUrl: project?.repoUrl ?? '',
    },
  });

  function onSubmit(data: Omit<CreateProjectInput, 'technologies'>) {
    startTransition(async () => {
      try {
        const payload = { ...data, technologies };
        if (isEdit) {
          await updateProject(project.id, payload);
          toast.success('Project updated');
        } else {
          await createProject(resumeId, payload);
          toast.success('Project added');
        }
        onOpenChange(false);
      } catch {
        toast.error('Failed to save');
      }
    });
  }

  const { register, handleSubmit, formState } = form;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="proj-name">Name *</Label>
        <Input id="proj-name" {...register('name')} />
        {formState.errors.name && (
          <p className="text-xs text-destructive">{formState.errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="proj-role">Role</Label>
          <Input id="proj-role" {...register('role')} placeholder="Lead contributor" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="proj-start">Start Date</Label>
          <Input id="proj-start" {...register('startDate')} placeholder="Jan 2023" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="proj-end">End Date</Label>
          <Input id="proj-end" {...register('endDate')} placeholder="Ongoing" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="proj-url">URL</Label>
          <Input id="proj-url" {...register('url')} placeholder="https://..." />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="proj-repo">GitHub URL</Label>
        <Input id="proj-repo" {...register('repoUrl')} placeholder="https://github.com/..." />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="proj-desc">Description</Label>
        <Textarea id="proj-desc" {...register('description')} rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Technologies</Label>
        <div className="flex flex-wrap gap-1">
          {technologies.map((t) => (
            <Badge key={t} variant="secondary" className="gap-1">
              {t}
              <button
                type="button"
                onClick={() => setTechnologies(technologies.filter((x) => x !== t))}
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

export function ProjectDialog({
  open,
  onOpenChange,
  resumeId,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  project?: Project | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{!!project ? 'Edit Project' : 'Add Project'}</DialogTitle>
        </DialogHeader>
        {open && (
          <ProjectDialogForm
            key={project?.id ?? 'new'}
            resumeId={resumeId}
            project={project}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
