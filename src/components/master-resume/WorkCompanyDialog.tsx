'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createWorkCompany, updateWorkCompany } from '@/server/actions/master-resume';
import {
  CreateWorkCompanySchema,
  type CreateWorkCompanyInput,
} from '@/lib/validations/master-resume';
import type { WorkCompanyWithRoles } from '@/types/master-resume';

const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance'] as const;

function WorkCompanyDialogForm({
  resumeId,
  company,
  onOpenChange,
}: {
  resumeId: string;
  company?: WorkCompanyWithRoles | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!company;
  const [employmentType, setEmploymentType] = useState<string>(
    (company?.employmentType as string | null) ?? ''
  );

  const form = useForm<CreateWorkCompanyInput>({
    resolver: zodResolver(CreateWorkCompanySchema),
    defaultValues: {
      name: company?.name ?? '',
      location: company?.location ?? '',
      employmentType:
        (company?.employmentType as CreateWorkCompanyInput['employmentType']) ?? undefined,
      startDate: company?.startDate ?? '',
      endDate: company?.endDate ?? '',
    },
  });

  function onSubmit(data: CreateWorkCompanyInput) {
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateWorkCompany(company.id, data);
          toast.success('Company updated');
        } else {
          await createWorkCompany(resumeId, data);
          toast.success('Company added');
        }
        onOpenChange(false);
      } catch {
        toast.error('Failed to save company');
      }
    });
  }

  const { register, handleSubmit, formState, setValue } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Company Name *</Label>
        <Input id="name" {...register('name')} />
        {formState.errors.name && (
          <p className="text-xs text-destructive">{formState.errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register('location')} placeholder="City, Country" />
        </div>
        <div className="space-y-1.5">
          <Label>Employment Type</Label>
          <Select
            value={employmentType}
            onValueChange={(v) => {
              setEmploymentType(v ?? '');
              setValue(
                'employmentType',
                v === '' ? undefined : (v as CreateWorkCompanyInput['employmentType'])
              );
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {employmentTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" {...register('startDate')} placeholder="Jan 2020" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" {...register('endDate')} placeholder="Dec 2022" />
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

export function WorkCompanyDialog({
  open,
  onOpenChange,
  resumeId,
  company,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  company?: WorkCompanyWithRoles | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{!!company ? 'Edit Company' : 'Add Company'}</DialogTitle>
        </DialogHeader>
        {open && (
          <WorkCompanyDialogForm
            key={company?.id ?? 'new'}
            resumeId={resumeId}
            company={company}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
