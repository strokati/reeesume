'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deleteAward } from '@/server/actions/master-resume';
import { AwardDialog } from './AwardDialog';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import type { Award } from '@/generated/prisma/client';

export function AwardCard({
  award,
  resumeId,
  dragHandleProps,
}: {
  award: Award;
  resumeId: string;
  dragHandleProps?: Record<string, unknown>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteAward(award.id);
        toast.success('Award deleted');
      } catch {
        toast.error('Failed to delete');
      }
    });
  }

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
            <span className="font-medium truncate">{award.title}</span>
            {award.issuer && (
              <span className="text-sm text-muted-foreground truncate">{award.issuer}</span>
            )}
            {award.date && <span className="text-xs text-muted-foreground">{award.date}</span>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
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
        {award.description && (
          <CardContent className="px-3 pb-3 pt-0 text-sm text-muted-foreground line-clamp-2">
            {award.description}
          </CardContent>
        )}
      </Card>
      <AwardDialog open={editOpen} onOpenChange={setEditOpen} resumeId={resumeId} award={award} />
    </>
  );
}
