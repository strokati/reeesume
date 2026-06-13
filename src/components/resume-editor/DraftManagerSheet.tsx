'use client';

import { useState, useTransition } from 'react';
import { Plus, Copy, Trash2, Star, ShieldCheck } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  createResumeDraft,
  renameResumeDraft,
  deleteResumeDraft,
  setActiveDraft,
  duplicateDraft,
  fetchResumeDrafts,
} from '@/server/actions/resume-drafts';
import { toast } from 'sonner';
import type { ResumeDraft } from '@/generated/prisma/client';

export function DraftManagerSheet({
  open,
  onOpenChange,
  applicationId,
  drafts,
  activeDraftId,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  drafts: ResumeDraft[];
  activeDraftId: string;
  onUpdate: (drafts: ResumeDraft[], newActiveId?: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  function sortedDrafts() {
    return [...drafts].sort((a, b) => {
      if (a.id === activeDraftId) return -1;
      if (b.id === activeDraftId) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  function handleNew() {
    startTransition(async () => {
      try {
        const draftId = await createResumeDraft(applicationId, '');
        const updated = await fetchResumeDrafts(applicationId);
        onUpdate(updated, draftId);
        toast.success('New draft created');
      } catch {
        toast.error('Failed to create draft');
      }
    });
  }

  function handleSetActive(id: string) {
    startTransition(async () => {
      try {
        await setActiveDraft(id, applicationId);
        onUpdate(drafts, id);
        toast.success('Draft activated');
      } catch {
        toast.error('Failed to activate draft');
      }
    });
  }

  function handleDuplicate(id: string) {
    startTransition(async () => {
      try {
        await duplicateDraft(id);
        const updated = await fetchResumeDrafts(applicationId);
        onUpdate(updated);
        toast.success('Draft duplicated');
      } catch {
        toast.error('Failed to duplicate draft');
      }
    });
  }

  function handleDelete(id: string) {
    if (drafts.length <= 1) {
      toast.error('Cannot delete the only draft');
      return;
    }
    startTransition(async () => {
      try {
        await deleteResumeDraft(id);
        const updated = await fetchResumeDrafts(applicationId);
        const newActive = id === activeDraftId ? updated[0]?.id : undefined;
        onUpdate(updated, newActive);
        toast.success('Draft deleted');
      } catch {
        toast.error('Failed to delete draft');
      }
    });
  }

  function handleRename(id: string) {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    startTransition(async () => {
      try {
        await renameResumeDraft(id, renameValue.trim());
        const updated = drafts.map((d) => (d.id === id ? { ...d, name: renameValue.trim() } : d));
        onUpdate(updated);
        setRenamingId(null);
      } catch {
        toast.error('Failed to rename');
      }
    });
  }

  function getAtsScore(draft: ResumeDraft): number | null {
    const score = draft.atsScore as { overallScore?: number } | null;
    return score?.overallScore ?? null;
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    exported: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle>Drafts</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          <Button size="sm" onClick={handleNew} disabled={isPending} className="w-full">
            <Plus className="h-4 w-4 mr-1.5" />
            New Draft
          </Button>

          {sortedDrafts().map((draft) => {
            const isActive = draft.id === activeDraftId;
            const ats = getAtsScore(draft);

            return (
              <div
                key={draft.id}
                className={`rounded-xl border p-3 space-y-2 ${
                  isActive ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {renamingId === draft.id ? (
                    <Input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRename(draft.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(draft.id);
                      }}
                      autoFocus
                      className="h-7 text-sm"
                    />
                  ) : (
                    <button
                      type="button"
                      className="text-sm font-medium text-left hover:underline"
                      onClick={() => {
                        setRenamingId(draft.id);
                        setRenameValue(draft.name);
                      }}
                    >
                      {draft.name}
                    </button>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-[0.6rem] ${statusColors[draft.status] ?? ''}`}
                  >
                    {draft.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(draft.createdAt).toLocaleDateString()}</span>
                  {ats !== null && (
                    <span className="flex items-center gap-0.5">
                      <ShieldCheck className="h-3 w-3" />
                      ATS: {ats}
                    </span>
                  )}
                </div>

                <div className="flex gap-1">
                  {!isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleSetActive(draft.id)}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Set Active
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleDuplicate(draft.id)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Duplicate
                  </Button>
                  {drafts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-red-600"
                      onClick={() => handleDelete(draft.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
