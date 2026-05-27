'use client';

import { useState, useTransition } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { markDraftReady, revertDraftToDraft } from '@/server/actions/resume-drafts';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export function MarkReadyButton({ draftId, status }: { draftId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleMarkReady() {
    setShowConfirm(false);
    startTransition(async () => {
      try {
        await markDraftReady(draftId);
        toast.success('Resume marked as ready!');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#22c55e', '#16a34a', '#4ade80'],
        });
      } catch {
        toast.error('Failed to mark as ready');
      }
    });
  }

  function handleRevert() {
    startTransition(async () => {
      try {
        await revertDraftToDraft(draftId);
        toast.success('Reverted to draft');
      } catch {
        toast.error('Failed to revert');
      }
    });
  }

  if (status === 'ready') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleRevert}
        disabled={isPending}
        className="text-green-700 border-green-200 hover:bg-green-50 dark:text-green-300 dark:border-green-800"
      >
        <Check className="h-4 w-4 mr-1" />
        Ready
        <RotateCcw className="h-3 w-3 ml-1.5 opacity-50" />
      </Button>
    );
  }

  return (
    <>
      <Button size="sm" onClick={() => setShowConfirm(true)} disabled={isPending}>
        <Check className="h-4 w-4 mr-1" />
        Mark Ready
      </Button>
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Ready?</DialogTitle>
            <DialogDescription>
              This flags your resume as submission-ready for this application. You can still edit it
              later — just click &ldquo;Ready&rdquo; again to revert.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkReady}>
              <Check className="h-4 w-4 mr-1" />
              Mark as Ready
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
