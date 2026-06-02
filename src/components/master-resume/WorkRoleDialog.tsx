'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createWorkRole, updateWorkRole } from '@/server/actions/master-resume';
import { CreateWorkRoleSchema, type CreateWorkRoleInput } from '@/lib/validations/master-resume';
import type { WorkCompanyWithRoles } from '@/types/master-resume';
import { X, Plus } from 'lucide-react';

type WorkRole = WorkCompanyWithRoles['roles'][number];

function StringListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [newItem, setNewItem] = useState('');
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
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
          placeholder="Add item..."
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

function WorkRoleDialogForm({
  companyId,
  role,
  onOpenChange,
}: {
  companyId: string;
  role?: WorkRole | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!role;

  const [responsibilities, setResponsibilities] = useState<string[]>(
    (role?.responsibilities as string[] | null) ?? []
  );
  const [achievements, setAchievements] = useState<string[]>(
    (role?.achievements as string[] | null) ?? []
  );
  const [technologies, setTechnologies] = useState<string[]>(
    (role?.technologies as string[] | null) ?? []
  );
  const [tagInput, setTagInput] = useState('');
  const [workArrangement, setWorkArrangement] = useState<string>(
    (role?.workArrangement as string | null) ?? ''
  );

  const form = useForm<{ title: string; startDate?: string; endDate?: string }>({
    resolver: zodResolver(
      CreateWorkRoleSchema.pick({ title: true, startDate: true, endDate: true })
    ),
    values: {
      title: role?.title ?? '',
      startDate: role?.startDate ?? '',
      endDate: role?.endDate ?? '',
    },
  });

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !technologies.includes(tag)) {
      setTechnologies([...technologies, tag]);
      setTagInput('');
    }
  }

  function onSubmit(data: { title: string; startDate?: string; endDate?: string }) {
    const payload: CreateWorkRoleInput = {
      ...data,
      workArrangement: workArrangement
        ? (workArrangement as CreateWorkRoleInput['workArrangement'])
        : undefined,
      responsibilities: responsibilities.filter((s) => s.trim()),
      achievements: achievements.filter((s) => s.trim()),
      technologies,
    };
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateWorkRole(role.id, payload);
          toast.success('Role updated');
        } else {
          await createWorkRole(companyId, payload);
          toast.success('Role added');
        }
        onOpenChange(false);
        router.refresh();
      } catch {
        toast.error('Failed to save role');
      }
    });
  }

  const { register, handleSubmit, formState } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="role-title">Role Title *</Label>
        <Input id="role-title" {...register('title')} />
        {formState.errors.title && (
          <p className="text-xs text-destructive">{formState.errors.title.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="role-start">Start Date</Label>
          <Input id="role-start" {...register('startDate')} placeholder="Jan 2020" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role-end">End Date</Label>
          <Input id="role-end" {...register('endDate')} placeholder="Present" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Work Arrangements</Label>
        <Select value={workArrangement} onValueChange={(v) => setWorkArrangement(v ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select arrangement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="On-Site">On-Site</SelectItem>
            <SelectItem value="Hybrid">Hybrid</SelectItem>
            <SelectItem value="Remote">Remote</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <StringListEditor
        label="Responsibilities"
        items={responsibilities}
        onChange={setResponsibilities}
      />
      <StringListEditor label="Achievements" items={achievements} onChange={setAchievements} />

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
              addTag();
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

export function WorkRoleDialog({
  open,
  onOpenChange,
  companyId,
  role,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  role?: WorkRole | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{!!role ? 'Edit Role' : 'Add Role'}</DialogTitle>
        </DialogHeader>
        {open && (
          <WorkRoleDialogForm
            key={role?.id ?? 'new'}
            companyId={companyId}
            role={role}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
