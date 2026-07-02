'use client';

import { useRef, useState, useTransition } from 'react';
import { Download, Upload, AlertTriangle, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { downloadUserArchive, restoreUserArchive } from '@/server/actions/data-export';

type ArchivePreview = {
  size: number;
  version: unknown;
  createdAt: unknown;
  counts: {
    masterResumes: number;
    vacancies: number;
    applications: number;
    aiProviderConfigs: number;
    aiCallLogs: number;
    aiPromptOverrides: number;
  };
};

const CONFIRM_WORD = 'restore';

export function DataExportPanel() {
  const [isExporting, startExport] = useTransition();
  const [isRestoring, startRestore] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<string | null>(null);
  const [preview, setPreview] = useState<ArchivePreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    startExport(async () => {
      try {
        const { filename, json } = await downloadUserArchive();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success(`Backup downloaded as ${filename}`);
      } catch {
        toast.error('Failed to generate backup');
      }
    });
  }

  function resetFile() {
    setFileName(null);
    setFileContents(null);
    setPreview(null);
    setPreviewError(null);
    setConfirmText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    resetFile();
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setFileContents(text);
      try {
        const parsed = JSON.parse(text) as Record<string, unknown>;
        const counts: ArchivePreview['counts'] = {
          masterResumes: countArray(parsed.masterResumes),
          vacancies: countArray(parsed.vacancies),
          applications: countArray(parsed.applications),
          aiProviderConfigs: countArray(parsed.aiProviderConfigs),
          aiCallLogs: countArray(parsed.aiCallLogs),
          aiPromptOverrides: countArray(parsed.aiPromptOverrides),
        };
        setPreview({
          size: file.size,
          version: parsed.version,
          createdAt: parsed.createdAt,
          counts,
        });
      } catch {
        setPreviewError('File is not valid JSON.');
      }
    };
    reader.onerror = () => setPreviewError('Could not read file.');
    reader.readAsText(file);
  }

  function handleRestore() {
    if (!fileContents || confirmText !== CONFIRM_WORD || isRestoring) return;
    startRestore(async () => {
      const result = await restoreUserArchive(fileContents);
      if (result.ok) {
        toast.success(result.summary);
        resetFile();
      } else {
        toast.error(result.error);
      }
    });
  }

  const canRestore = !!preview && !previewError && confirmText === CONFIRM_WORD && !isRestoring;

  return (
    <div className="space-y-4">
      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </CardTitle>
          <CardDescription>
            Download a JSON archive of all your data — master resumes, applications, drafts, AI
            provider configs (with encrypted keys), and call logs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4" />
            {isExporting ? 'Preparing backup…' : 'Download backup'}
          </Button>
        </CardContent>
      </Card>

      {/* Import / Restore */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import / Restore
          </CardTitle>
          <CardDescription>
            Replace your current data with the contents of an archive file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 translate-y-0.5" />
            <div>
              <p className="font-medium">Destructive action.</p>
              <p className="text-xs opacity-90">
                Restoring wipes everything you currently have and replaces it with the archive
                contents. Cannot be undone except by re-importing a previous backup. A pre-restore
                snapshot is written to <code className="font-mono">./backups/</code> as a
                last-resort recovery file.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Choose archive file</label>
            <Input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileSelect}
              disabled={isRestoring}
            />
            {fileName && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileJson className="h-3.5 w-3.5" />
                <span className="font-mono">{fileName}</span>
              </div>
            )}
          </div>

          {previewError && (
            <p className="text-sm text-destructive" role="alert">
              {previewError}
            </p>
          )}

          {preview && !previewError && (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Archive version</span>
                <span className="font-mono">{String(preview.version)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-mono">{formatPreviewDate(preview.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">File size</span>
                <span className="font-mono">{formatBytes(preview.size)}</span>
              </div>
              <div className="border-t pt-2 mt-2 text-xs text-muted-foreground">
                Contents: {preview.counts.masterResumes} master resume(s),{' '}
                {preview.counts.vacancies} vacancies, {preview.counts.applications} applications,{' '}
                {preview.counts.aiProviderConfigs} AI configs, {preview.counts.aiCallLogs} AI call
                logs, {preview.counts.aiPromptOverrides} prompt overrides.
              </div>
            </div>
          )}

          {preview && !previewError && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Type <code className="font-mono font-semibold">{CONFIRM_WORD}</code> to confirm
              </label>
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_WORD}
                disabled={isRestoring}
                autoComplete="off"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button onClick={handleRestore} disabled={!canRestore} variant="destructive">
              <Upload className="h-4 w-4" />
              {isRestoring ? 'Restoring…' : 'Restore (destructive)'}
            </Button>
            <Button onClick={resetFile} variant="outline" disabled={isRestoring || !fileName}>
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Note: AI provider API keys only work after restore if this server&apos;s{' '}
            <code className="font-mono">NEXTAUTH_SECRET</code> matches the one used at export time.
            Otherwise keys will need to be re-entered in AI Providers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function countArray(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatPreviewDate(value: unknown): string {
  if (typeof value !== 'string') return 'unknown';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}
