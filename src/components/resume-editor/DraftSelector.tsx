'use client';

import { useState, useTransition } from 'react';
import { Check, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  createResumeDraft,
  renameResumeDraft,
  deleteResumeDraft,
  setActiveDraft,
} from '@/server/actions/resume-drafts';
import { toast } from 'sonner';
import type { ResumeDraft } from '@prisma/client';

export function DraftSelector({
  applicationId,
  drafts,
  activeDraft,
  onSwitch,
  onDraftsUpdate,
}: {
  applicationId: string;
  drafts: ResumeDraft[];
  activeDraft: ResumeDraft;
  onSwitch: (draft: ResumeDraft) => void;
  onDraftsUpdate: (drafts: ResumeDraft[]) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  function handleNewDraft() {
    startTransition(async () => {
      try {
        const draftId = await createResumeDraft(applicationId, '');
        // Refetch by updating local state
        const { getResumeDrafts } = await import('@/server/queries/resume-drafts');
        const updated = await getResumeDrafts(applicationId);
        onDraftsUpdate(updated);
        const newDraft = updated.find((d) => d.id === draftId);
        if (newDraft) onSwitch(newDraft);
        toast.success('New draft created');
      } catch {
        toast.error('Failed to create draft');
      }
    });
  }

  function handleSelect(draft: ResumeDraft) {
    if (draft.id === activeDraft.id) return;
    startTransition(async () => {
      try {
        await setActiveDraft(draft.id, applicationId);
        onSwitch(draft);
      } catch {
        toast.error('Failed to switch draft');
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
        onDraftsUpdate(updated);
        if (id === activeDraft.id) {
          onSwitch({ ...activeDraft, name: renameValue.trim() });
        }
        setRenamingId(null);
      } catch {
        toast.error('Failed to rename draft');
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
        const { getResumeDrafts } = await import('@/server/queries/resume-drafts');
        const updated = await getResumeDrafts(applicationId);
        onDraftsUpdate(updated);
        if (id === activeDraft.id && updated.length > 0) {
          onSwitch(updated[0]);
        }
        toast.success('Draft deleted');
      } catch {
        toast.error('Failed to delete draft');
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm min-w-[140px]">
        <span className="truncate">{activeDraft.name}</span>
        <span className="text-xs text-muted-foreground ml-1">({drafts.length})</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {drafts.map((draft) => (
          <DropdownMenuItem
            key={draft.id}
            onClick={() => handleSelect(draft)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2 min-w-0">
              {draft.isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
              <span className="truncate">{draft.name}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRenamingId(draft.id);
                  setRenameValue(draft.name);
                }}
                className="p-1 hover:bg-muted rounded"
              >
                <Pencil className="h-3 w-3" />
              </button>
              {drafts.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(draft.id);
                  }}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleNewDraft} disabled={isPending}>
          <Plus className="h-4 w-4 mr-2" />
          New Draft
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Inline rename overlay */}
      {renamingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-background rounded-lg p-4 shadow-lg w-72 space-y-3">
            <p className="text-sm font-medium">Rename Draft</p>
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(renamingId);
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleRename(renamingId)}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRenamingId(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </DropdownMenu>
  );
}
