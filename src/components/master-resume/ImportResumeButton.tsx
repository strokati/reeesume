'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImportResumeDialog } from './ImportResumeDialog';

type Config = { providerId: string; model: string; isDefault: boolean; apiKey: string };

export function ImportResumeButton({ resumeId, configs }: { resumeId: string; configs: Config[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4 mr-1.5" />
        Import Resume
      </Button>
      <ImportResumeDialog
        open={open}
        onOpenChange={setOpen}
        resumeId={resumeId}
        configs={configs}
      />
    </>
  );
}
