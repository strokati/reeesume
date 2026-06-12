'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deletePublication } from '@/server/actions/master-resume';
import { PublicationDialog } from './PublicationDialog';
import { Pencil, Trash2, GripVertical, ExternalLink } from 'lucide-react';
import type { Publication } from '@/generated/prisma/client';

export function PublicationCard({
  publication,
  resumeId,
  dragHandleProps,
}: {
  publication: Publication;
  resumeId: string;
  dragHandleProps?: Record<string, unknown>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deletePublication(publication.id);
        toast.success('Deleted');
      } catch {
        toast.error('Failed to delete');
      }
    });
  }

  const meta = [publication.publisher, publication.date].filter(Boolean).join(' · ');

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
            <span className="font-medium italic truncate">{publication.title}</span>
            {publication.authors && (
              <span className="text-sm text-muted-foreground truncate">{publication.authors}</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {(publication.url || publication.doi) && (
              <a
                href={publication.url || `https://doi.org/${publication.doi}`}
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
        <CardContent className="px-3 pb-3 pt-0 space-y-1 text-sm">
          {meta && <p className="text-muted-foreground">{meta}</p>}
          {publication.description && <p className="line-clamp-2">{publication.description}</p>}
        </CardContent>
      </Card>
      <PublicationDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        resumeId={resumeId}
        publication={publication}
      />
    </>
  );
}
