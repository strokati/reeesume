'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deleteCertification } from '@/server/actions/master-resume';
import { CertificationDialog } from './CertificationDialog';
import { Pencil, Trash2, GripVertical, ExternalLink } from 'lucide-react';
import type { Certification } from '@prisma/client';

export function CertificationCard({
  certification,
  resumeId,
  dragHandleProps,
}: {
  certification: Certification;
  resumeId: string;
  dragHandleProps?: Record<string, unknown>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteCertification(certification.id);
        toast.success('Certification deleted');
      } catch {
        toast.error('Failed to delete');
      }
    });
  }

  const dateRange = certification.issueDate
    ? `${certification.issueDate}${certification.expiryDate ? ` – ${certification.expiryDate}` : ' – No expiry'}`
    : null;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
          <div className="flex items-center gap-2 min-w-0">
            {dragHandleProps && (
              <span
                {...dragHandleProps}
                className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
              >
                <GripVertical className="h-4 w-4" />
              </span>
            )}
            <span className="font-medium truncate">{certification.name}</span>
            {certification.issuer && (
              <span className="text-sm text-muted-foreground truncate">{certification.issuer}</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {certification.url && (
              <a
                href={certification.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <Button variant="ghost" size="icon-sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-3 w-3" />
            </Button>
            {confirmDelete ? (
              <>
                <Button variant="destructive" size="xs" onClick={handleDelete} disabled={isPending}>
                  Yes
                </Button>
                <Button variant="ghost" size="xs" onClick={() => setConfirmDelete(false)}>
                  No
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="icon-sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0 text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-x-3">
            {dateRange && <span>{dateRange}</span>}
            {certification.credentialId && <span>ID: {certification.credentialId}</span>}
          </div>
        </CardContent>
      </Card>
      <CertificationDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        resumeId={resumeId}
        certification={certification}
      />
    </>
  );
}
