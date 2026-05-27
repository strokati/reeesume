'use client';

import { useState, useTransition, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createApplication } from '@/server/actions/applications';
import {
  CreateApplicationSchema,
  type CreateApplicationInput,
} from '@/lib/validations/applications';
import type { MasterResumeSummary } from '@/types/master-resume';

const locationTypes = ['On-site', 'Hybrid', 'Remote'] as const;

function NewApplicationForm({
  resumes,
  onSuccess,
}: {
  resumes: MasterResumeSummary[];
  onSuccess: (id: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [locationType, setLocationType] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState(
    () => resumes.find((r) => r.isDefault)?.id ?? resumes[0]?.id ?? ''
  );

  const defaultResumeId = resumes.find((r) => r.isDefault)?.id ?? resumes[0]?.id ?? '';

  const form = useForm<CreateApplicationInput>({
    resolver: zodResolver(CreateApplicationSchema),
    defaultValues: {
      companyName: '',
      jobTitle: '',
      location: '',
      locationType: undefined,
      salaryMin: undefined,
      salaryMax: undefined,
      currency: 'USD',
      sourceUrl: '',
      rawText: '',
      masterResumeId: defaultResumeId,
    },
    mode: 'onBlur',
  });

  const { register, handleSubmit, formState, setValue, trigger } = form;

  async function handleNext() {
    const valid = await trigger(['companyName', 'jobTitle']);
    if (valid) setStep(2);
  }

  function onSubmit(data: CreateApplicationInput) {
    startTransition(async () => {
      try {
        const id = await createApplication({ ...data, masterResumeId: selectedResumeId });
        toast.success('Application created');
        onSuccess(id);
      } catch {
        toast.error('Failed to create application');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center gap-2 mb-5">
        <div
          className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}
        />
        <div
          className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}
        />
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>New Application</DialogTitle>
            <DialogDescription>Enter the job details for this application.</DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input id="companyName" {...register('companyName')} placeholder="e.g. Acme Corp" />
            {formState.errors.companyName && (
              <p className="text-xs text-destructive">{formState.errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input id="jobTitle" {...register('jobTitle')} placeholder="e.g. Senior Engineer" />
            {formState.errors.jobTitle && (
              <p className="text-xs text-destructive">{formState.errors.jobTitle.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Source Resume</Label>
            <Select
              value={selectedResumeId}
              onValueChange={(v) => {
                setSelectedResumeId(v ?? '');
                setValue('masterResumeId', v ?? '');
              }}
            >
              <SelectTrigger className="w-full">
                {(() => {
                  const r = resumes.find((x) => x.id === selectedResumeId);
                  return r ? `${r.name} (${r.language.toUpperCase()})` : 'Select resume';
                })()}
              </SelectTrigger>
              <SelectContent>
                {resumes.map((r) => (
                  <SelectItem
                    key={r.id}
                    value={r.id}
                    label={`${r.name} (${r.language.toUpperCase()})`}
                  >
                    {r.name} ({r.language.toUpperCase()}){r.isDefault ? ' — Default' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} placeholder="City, Country" />
            </div>
            <div className="space-y-1.5">
              <Label>Location Type</Label>
              <Select
                value={locationType}
                onValueChange={(v) => {
                  setLocationType(v ?? '');
                  setValue(
                    'locationType',
                    (v || undefined) as CreateApplicationInput['locationType']
                  );
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {locationTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="salaryMin">Salary Min</Label>
              <Input id="salaryMin" type="number" {...register('salaryMin')} placeholder="80000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salaryMax">Salary Max</Label>
              <Input id="salaryMax" type="number" {...register('salaryMax')} placeholder="120000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" {...register('currency')} placeholder="USD" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sourceUrl">Source URL</Label>
            <Input id="sourceUrl" {...register('sourceUrl')} placeholder="https://..." />
            {formState.errors.sourceUrl && (
              <p className="text-xs text-destructive">{formState.errors.sourceUrl.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>Job Posting (Optional)</DialogTitle>
            <DialogDescription>Paste the job posting text for AI analysis later.</DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="rawText">Job Posting Text</Label>
            <Textarea
              id="rawText"
              {...register('rawText')}
              placeholder="Paste the full job description here..."
              className="min-h-48"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Application'}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}

export function NewApplicationDialog({
  open,
  onOpenChange,
  resumes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumes: MasterResumeSummary[];
}) {
  const router = useRouter();
  const [formKey, setFormKey] = useState(0);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) setFormKey((k) => k + 1);
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  function handleSuccess(id: string) {
    onOpenChange(false);
    router.push(`/applications/${id}`);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        {open && <NewApplicationForm key={formKey} resumes={resumes} onSuccess={handleSuccess} />}
      </DialogContent>
    </Dialog>
  );
}
