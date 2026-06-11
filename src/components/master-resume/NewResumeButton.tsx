'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewResumeDialog } from './NewResumeDialog';

export function NewResumeButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1.5" />
        New Resume
      </Button>
      <NewResumeDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
