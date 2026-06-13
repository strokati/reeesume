'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createPublication, updatePublication } from '@/server/actions/master-resume';
import {
  CreatePublicationSchema,
  type CreatePublicationInput,
} from '@/lib/validations/master-resume';
import type { Publication } from '@/generated/prisma/client';

function PublicationDialogForm({
  resumeId,
  publication,
  onOpenChange,
}: {
  resumeId: string;
  publication?: Publication | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!publication;
  const form = useForm<CreatePublicationInput>({
    resolver: zodResolver(CreatePublicationSchema),
    values: {
      title: publication?.title ?? '',
      authors: publication?.authors ?? '',
      publisher: publication?.publisher ?? '',
      date: publication?.date ?? '',
      url: publication?.url ?? '',
      doi: publication?.doi ?? '',
      description: publication?.description ?? '',
    },
  });
  function onSubmit(data: CreatePublicationInput) {
    startTransition(async () => {
      try {
        if (isEdit) {
          await updatePublication(publication.id, data);
          toast.success('Updated');
        } else {
          await createPublication(resumeId, data);
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
        <Label htmlFor="pub-title">Title *</Label>
        <Input id="pub-title" {...register('title')} />
        {formState.errors.title && (
          <p className="text-xs text-destructive">{formState.errors.title.message}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pub-authors">Authors</Label>
          <Input id="pub-authors" {...register('authors')} placeholder="J. Smith, A. Lee" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pub-publisher">Publisher</Label>
          <Input id="pub-publisher" {...register('publisher')} placeholder="IEEE, ACM..." />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pub-date">Date</Label>
          <Input id="pub-date" {...register('date')} placeholder="Mar 2024" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pub-doi">DOI</Label>
          <Input id="pub-doi" {...register('doi')} placeholder="10.1000/..." />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pub-url">URL</Label>
        <Input id="pub-url" {...register('url')} placeholder="https://..." />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pub-desc">Description</Label>
        <Textarea id="pub-desc" {...register('description')} rows={3} />
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

export function PublicationDialog({
  open,
  onOpenChange,
  resumeId,
  publication,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  publication?: Publication | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{!!publication ? 'Edit Publication' : 'Add Publication'}</DialogTitle>
        </DialogHeader>
        {open && (
          <PublicationDialogForm
            key={publication?.id ?? 'new'}
            resumeId={resumeId}
            publication={publication}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
