'use client';

import { useState, useRef, useTransition } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useImportResume } from '@/hooks/use-import-resume';
import { applyImportedResume } from '@/server/actions/master-resume';
import { getSectionCounts, type ImportedResumeData } from '@/lib/ai/prompts/import-resume';
import { PROVIDER_REGISTRY } from '@/lib/ai/providers';
import { toast } from 'sonner';

type Config = { providerId: string; model: string; isDefault: boolean; apiKey: string };
type Step = 'upload' | 'processing' | 'review';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function ImportResumeDialog({
  open,
  onOpenChange,
  resumeId,
  configs,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  configs?: Config[];
}) {
  const [step, setStep] = useState<Step>('upload');
  const [selectedProvider, setSelectedProvider] = useState<string>(
    configs?.find((c) => c.isDefault)?.providerId ?? configs?.[0]?.providerId ?? ''
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [mode, setMode] = useState<'overwrite' | 'merge'>('merge');
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { upload, result, progress, isLoading, error: importError } = useImportResume();
  const hasProvider = (configs?.length ?? 0) > 0;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) return;

    if (
      ![
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(file.type)
    ) {
      setFileError('Only PDF and DOCX files are accepted.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File too large. Maximum size is 5 MB.');
      return;
    }
    setSelectedFile(file);
  }

  function handleImport() {
    if (!selectedFile || !selectedProvider) return;
    setStep('processing');
    upload(selectedFile, selectedProvider);
  }

  // Transition to review when result is ready
  function handleResultReady() {
    if (result && !isLoading) {
      setStep('review');
    }
  }

  function handleApply() {
    if (!result) return;
    startTransition(async () => {
      try {
        await applyImportedResume(resumeId, result, mode);
        toast.success('Resume imported successfully!');
        onOpenChange(false);
        resetState();
      } catch {
        toast.error('Failed to apply imported data.');
      }
    });
  }

  function resetState() {
    setStep('upload');
    setSelectedFile(null);
    setFileError(null);
    setMode('merge');
  }

  function handleOpenChange(val: boolean) {
    if (!val) resetState();
    onOpenChange(val);
  }

  // Check if processing is done
  const processingDone = !isLoading && (result !== null || importError !== null);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Resume</DialogTitle>
          <DialogDescription>
            {step === 'upload' &&
              'Upload an existing resume (PDF or DOCX) and AI will extract it into your master resume.'}
            {step === 'processing' && 'AI is extracting your resume data...'}
            {step === 'review' && 'Review the extracted data before applying.'}
          </DialogDescription>
        </DialogHeader>

        {!hasProvider && (
          <div className="flex items-center gap-3 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            <AlertCircle className="h-5 w-5 shrink-0" />
            Configure an AI provider in Settings to use resume import.
          </div>
        )}

        {step === 'upload' && hasProvider && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 p-8 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                {selectedFile ? selectedFile.name : 'Click to select a file'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF or DOCX, max 5 MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />

            {fileError && <p className="text-sm text-red-600">{fileError}</p>}

            {selectedFile && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{selectedFile.name}</span>
                <span className="text-muted-foreground">
                  ({(selectedFile.size / 1024).toFixed(0)} KB)
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Select
                value={selectedProvider}
                onValueChange={(v) => {
                  if (v) setSelectedProvider(v);
                }}
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {configs?.map((c) => (
                    <SelectItem key={c.providerId} value={c.providerId}>
                      {PROVIDER_REGISTRY.find((p) => p.id === c.providerId)?.name ?? c.providerId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={handleImport}
              disabled={!selectedFile || !selectedProvider}
            >
              <Upload className="h-4 w-4 mr-1.5" />
              Import with AI
            </Button>
          </div>
        )}

        {step === 'processing' && (
          <div className="space-y-4">
            {progress.map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-sm">
                {p.done ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                ) : processingDone ? (
                  <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                )}
                <span className={p.done ? '' : 'text-muted-foreground'}>
                  {p.done
                    ? `${p.name} ✓`
                    : processingDone
                      ? `${p.name} — not found`
                      : `Extracting ${p.name.toLowerCase()}...`}
                </span>
              </div>
            ))}

            {importError && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                {importError}
              </div>
            )}

            {processingDone && !importError && (
              <Button
                className="w-full"
                onClick={() => {
                  handleResultReady();
                  setStep('review');
                }}
              >
                Review Results
              </Button>
            )}
            {processingDone && importError && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep('upload');
                  resetState();
                }}
              >
                Try Again
              </Button>
            )}
          </div>
        )}

        {step === 'review' && result && (
          <ReviewStep
            data={result}
            mode={mode}
            onModeChange={setMode}
            onApply={handleApply}
            onCancel={() => {
              handleOpenChange(false);
            }}
            isPending={isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReviewStep({
  data,
  mode,
  onModeChange,
  onApply,
  onCancel,
  isPending,
}: {
  data: ImportedResumeData;
  mode: 'overwrite' | 'merge';
  onModeChange: (m: 'overwrite' | 'merge') => void;
  onApply: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const counts = getSectionCounts(data);
  const emptySections = Object.entries(counts).filter(([, count]) => count === 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(counts).map(([section, count]) => (
          <div
            key={section}
            className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
          >
            <span className="text-muted-foreground">{section}</span>
            <Badge variant="outline" className="text-xs">
              {count}
            </Badge>
          </div>
        ))}
      </div>

      {emptySections.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>No data extracted for: {emptySections.map(([s]) => s).join(', ')}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Mode:</span>
        <Select value={mode} onValueChange={(v) => onModeChange(v as 'overwrite' | 'merge')}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="merge">Merge (append)</SelectItem>
            <SelectItem value="overwrite">Overwrite (replace all)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={onApply} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              Applying...
            </>
          ) : (
            'Apply to Master Resume'
          )}
        </Button>
      </div>
    </div>
  );
}
