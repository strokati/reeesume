'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createVolunteeringRole, updateVolunteeringRole } from '@/server/actions/master-resume';
import {
  CreateVolunteeringRoleSchema,
  type CreateVolunteeringRoleInput,
} from '@/lib/validations/master-resume';
import type { VolunteeringRole } from '@prisma/client';
import { X, Plus } from 'lucide-react';

function VolunteeringDialogForm({
  resumeId,
  role,
  onOpenChange,
}: {
  resumeId: string;
  role?: VolunteeringRole | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!role;
  const [responsibilities, setResponsibilities] = useState<string[]>(
    (role?.responsibilities as string[] | null) ?? []
  );
  const [newResp, setNewResp] = useState('');

  const form = useForm<Omit<CreateVolunteeringRoleInput, 'responsibilities'>>({
    resolver: zodResolver(CreateVolunteeringRoleSchema.omit({ responsibilities: true })),
    values: {
      organization: role?.organization ?? '',
      role: role?.role ?? '',
      location: role?.location ?? '',
      startDate: role?.startDate ?? '',
      endDate: role?.endDate ?? '',
    },
  });

  function onSubmit(data: Omit<CreateVolunteeringRoleInput, 'responsibilities'>) {
    startTransition(async () => {
      try {
        const payload = { ...data, responsibilities: responsibilities.filter((s) => s.trim()) };
        if (isEdit) {
          await updateVolunteeringRole(role.id, payload);
          toast.success('Updated');
        } else {
          await createVolunteeringRole(resumeId, payload);
          toast.success('Added');
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
        <Label htmlFor="vol-org">Organization *</Label>
        <Input id="vol-org" {...register('organization')} />
        {formState.errors.organization && (
          <p className="text-xs text-destructive">{formState.errors.organization.message}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="vol-role">Role</Label>
          <Input id="vol-role" {...register('role')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vol-loc">Location</Label>
          <Input id="vol-loc" {...register('location')} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="vol-start">Start Date</Label>
          <Input id="vol-start" {...register('startDate')} placeholder="Jan 2022" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vol-end">End Date</Label>
          <Input id="vol-end" {...register('endDate')} placeholder="Current" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Responsibilities</Label>
        <ul className="space-y-1">
          {responsibilities.map((item, i) => (
            <li key={i} className="flex items-center gap-1">
              <Input
                value={item}
                onChange={(e) => {
                  const next = [...responsibilities];
                  next[i] = e.target.value;
                  setResponsibilities(next);
                }}
                className="text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setResponsibilities(responsibilities.filter((_, j) => j !== i))}
              >
                <X className="h-3 w-3" />
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex gap-1">
          <Input
            value={newResp}
            onChange={(e) => setNewResp(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (newResp.trim()) {
                  setResponsibilities([...responsibilities, newResp.trim()]);
                  setNewResp('');
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
              if (newResp.trim()) {
                setResponsibilities([...responsibilities, newResp.trim()]);
                setNewResp('');
              }
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
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

export function VolunteeringDialog({
  open,
  onOpenChange,
  resumeId,
  role,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  role?: VolunteeringRole | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{!!role ? 'Edit Volunteering Role' : 'Add Volunteering Role'}</DialogTitle>
        </DialogHeader>
        {open && (
          <VolunteeringDialogForm
            key={role?.id ?? 'new'}
            resumeId={resumeId}
            role={role}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
