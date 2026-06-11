'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Star, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { languageFlag, languageLabel } from '@/lib/utils/language';
import { formatRelativeTime } from '@/lib/utils';
import { setDefaultMasterResume, deleteMasterResume } from '@/server/actions/master-resume';
import { RenameResumeDialog } from './RenameResumeDialog';
import { toast } from 'sonner';
import type { MasterResumeSummary } from '@/types/master-resume';

export function MasterResumeCard({ resume }: { resume: MasterResumeSummary }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSetDefault() {
    startTransition(async () => {
      try {
        await setDefaultMasterResume(resume.id);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to set default.');
      }
    });
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMasterResume(resume.id);
      toast.success('Resume deleted.');
      setDeleteOpen(false);
      router.push('/master-resume');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete resume.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow"
        onClick={() => router.push(`/master-resume/${resume.id}`)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {resume.isDefault && (
                <Badge variant="secondary" className="mb-1.5 text-[0.65rem] px-1.5 py-0">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                  Default
                </Badge>
              )}
              <p className="font-semibold truncate">{resume.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {languageFlag(resume.language)} {languageLabel(resume.language)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Updated {formatRelativeTime(resume.updatedAt)}
              </p>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      setRenameOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Rename
                  </DropdownMenuItem>
                  {!resume.isDefault && (
                    <DropdownMenuItem onClick={handleSetDefault} disabled={isPending}>
                      <Star className="h-3.5 w-3.5" />
                      Set as Default
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {renameOpen && (
        <RenameResumeDialog
          resumeId={resume.id}
          currentName={resume.name}
          open={renameOpen}
          onOpenChange={setRenameOpen}
        />
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &ldquo;{resume.name}&rdquo;? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
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
