'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Plus, Pencil, Star, Trash2 } from 'lucide-react';
import { setDefaultMasterResume, deleteMasterResume } from '@/server/actions/master-resume';
import { NewResumeDialog } from './NewResumeDialog';
import { RenameResumeDialog } from './RenameResumeDialog';
import { toast } from 'sonner';
import type { MasterResumeSummary } from '@/types/master-resume';

const LANGUAGE_FLAGS: Record<string, string> = {
  en: '\u{1F1EC}\u{1F1E7}',
  de: '\u{1F1E9}\u{1F1EA}',
  fr: '\u{1F1EB}\u{1F1F7}',
  es: '\u{1F1EA}\u{1F1F8}',
  it: '\u{1F1EE}\u{1F1F9}',
  nl: '\u{1F1F3}\u{1F1F1}',
  pl: '\u{1F1F5}\u{1F1F1}',
};

function LanguageBadge({ code }: { code: string }) {
  const flag = LANGUAGE_FLAGS[code] ?? '\u{1F310}';
  return <span className="text-xs">{flag}</span>;
}

export function ResumeSwitcher({
  resumes,
  activeResumeId,
}: {
  resumes: MasterResumeSummary[];
  activeResumeId: string;
}) {
  const router = useRouter();
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<MasterResumeSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MasterResumeSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activeResume = resumes.find((r) => r.id === activeResumeId);

  async function handleSetDefault(id: string) {
    try {
      await setDefaultMasterResume(id);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to set default.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMasterResume(deleteTarget.id);
      toast.success('Resume deleted.');
      setDeleteTarget(null);
      if (deleteTarget.id === activeResumeId) {
        router.push('/master-resume');
      } else {
        router.refresh();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete resume.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" className="gap-2">
              {activeResume && <LanguageBadge code={activeResume.language} />}
              <span className="max-w-[200px] truncate">
                {activeResume?.name ?? 'Master Resume'}
              </span>
              {activeResume?.isDefault && (
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="w-64">
          {resumes.map((resume) => (
            <DropdownMenuItem
              key={resume.id}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                if (resume.id !== activeResumeId) {
                  router.push(`/master-resume/${resume.id}`);
                }
              }}
            >
              <LanguageBadge code={resume.language} />
              <span className="flex-1 truncate">{resume.name}</span>
              {resume.isDefault && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Default
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {resumes.map((resume) => (
            <div key={`actions-${resume.id}`} className="flex">
              <DropdownMenuItem
                className="flex-1 gap-2 text-xs text-muted-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  setRenameTarget(resume);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Rename &ldquo;{resume.name}&rdquo;
              </DropdownMenuItem>
            </div>
          ))}
          {resumes.some((r) => !r.isDefault) && (
            <>
              <DropdownMenuSeparator />
              {resumes
                .filter((r) => !r.isDefault)
                .map((resume) => (
                  <DropdownMenuItem
                    key={`default-${resume.id}`}
                    className="gap-2 text-xs text-muted-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSetDefault(resume.id);
                    }}
                  >
                    <Star className="h-3.5 w-3.5" />
                    Set &ldquo;{resume.name}&rdquo; as default
                  </DropdownMenuItem>
                ))}
            </>
          )}
          {resumes.length > 1 && (
            <>
              <DropdownMenuSeparator />
              {resumes.map((resume) => (
                <DropdownMenuItem
                  key={`delete-${resume.id}`}
                  className="gap-2 text-xs text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    setDeleteTarget(resume);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete &ldquo;{resume.name}&rdquo;
                </DropdownMenuItem>
              ))}
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-xs"
            onClick={(e) => {
              e.preventDefault();
              setNewDialogOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            New Master Resume
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NewResumeDialog open={newDialogOpen} onOpenChange={setNewDialogOpen} />

      {renameTarget && (
        <RenameResumeDialog
          resumeId={renameTarget.id}
          currentName={renameTarget.name}
          open={!!renameTarget}
          onOpenChange={(open) => {
            if (!open) setRenameTarget(null);
          }}
        />
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot
            be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
