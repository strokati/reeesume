'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { createWorkRoleWithCompany } from '@/server/actions/master-resume';

const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance'] as const;
const workArrangements = [
  { value: 'On-Site', label: 'On-Site' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'Remote', label: 'Remote' },
] as const;

const Schema = z.object({
  roleTitle: z.string().min(1, 'Role title is required'),
  companyName: z.string().min(1, 'Company name is required'),
  companyLocation: z.string().optional(),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance']).optional(),
  workArrangement: z.enum(['On-Site', 'Hybrid', 'Remote']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FormValues = z.infer<typeof Schema>;

function WorkRoleWithCompanyForm({
  resumeId,
  onOpenChange,
}: {
  resumeId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [employmentType, setEmploymentType] = useState('');
  const [workArrangement, setWorkArrangement] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      roleTitle: '',
      companyName: '',
      companyLocation: '',
      startDate: '',
      endDate: '',
    },
  });

  const { register, handleSubmit, formState, setValue } = form;

  function onSubmit(data: FormValues) {
    startTransition(async () => {
      try {
        await createWorkRoleWithCompany(resumeId, {
          companyName: data.companyName,
          companyLocation: data.companyLocation,
          employmentType: data.employmentType,
          roleTitle: data.roleTitle,
          startDate: data.startDate,
          endDate: data.endDate,
          workArrangement: data.workArrangement,
        });
        toast.success('Role added');
        onOpenChange(false);
      } catch {
        toast.error('Failed to add role');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Role info */}
      <div className="space-y-1.5">
        <Label htmlFor="roleTitle">Role Title *</Label>
        <Input id="roleTitle" {...register('roleTitle')} placeholder="Senior Software Engineer" />
        {formState.errors.roleTitle && (
          <p className="text-xs text-destructive">{formState.errors.roleTitle.message}</p>
        )}
      </div>

      {/* Company info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">Company *</Label>
          <Input id="companyName" {...register('companyName')} placeholder="Accenture" />
          {formState.errors.companyName && (
            <p className="text-xs text-destructive">{formState.errors.companyName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="companyLocation">Location</Label>
          <Input
            id="companyLocation"
            {...register('companyLocation')}
            placeholder="Kyiv, Ukraine"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Employment Type</Label>
          <Select
            value={employmentType}
            onValueChange={(v) => {
              setEmploymentType(v ?? '');
              setValue('employmentType', v as FormValues['employmentType']);
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
        <div className="space-y-1.5">
          <Label>Work Arrangements</Label>
          <Select
            value={workArrangement}
            onValueChange={(v) => {
              setWorkArrangement(v ?? '');
              setValue('workArrangement', v as FormValues['workArrangement']);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select arrangement" />
            </SelectTrigger>
            <SelectContent>
              {workArrangements.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" {...register('startDate')} placeholder="Jan 2020" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" {...register('endDate')} placeholder="Present" />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Adding...' : 'Add Role'}
        </Button>
      </div>
    </form>
  );
}

export function WorkRoleWithCompanyDialog({
  open,
  onOpenChange,
  resumeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Role</DialogTitle>
        </DialogHeader>
        {open && (
          <WorkRoleWithCompanyForm key="new-role" resumeId={resumeId} onOpenChange={onOpenChange} />
        )}
      </DialogContent>
    </Dialog>
  );
}
