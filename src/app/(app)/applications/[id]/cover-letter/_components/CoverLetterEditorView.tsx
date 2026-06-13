'use client';

import { useState, useCallback, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  ArrowLeft,
  FolderOpen,
  Sparkles,
  Check,
  RotateCcw,
  Bold as BoldIcon,
  Italic,
  Download,
  ChevronDown,
  Loader2,
  FileText,
} from 'lucide-react';
import { useExport } from '@/hooks/use-export';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToneSelector } from '@/components/cover-letter-editor/ToneSelector';
import { CoverLetterDraftSheet } from '@/components/cover-letter-editor/CoverLetterDraftSheet';
import {
  updateCoverLetterContent,
  updateCoverLetterTone,
  updateHiringManager,
  setActiveCoverLetterDraft,
  markCoverLetterReady,
  revertCoverLetterToDraft,
  listCoverLetterDrafts,
} from '@/server/actions/cover-letters';
import { useCoverLetterGeneration } from '@/hooks/use-cover-letter-generation';
import { PROVIDER_REGISTRY } from '@/lib/ai/provider-registry';
import type { ApplicationDetail } from '@/types/applications';
import type { CoverLetterDraft } from '@/generated/prisma/client';

type Config = { providerId: string; model: string; isDefault: boolean; apiKey: string };

function normalizeToHtml(content: string | null | undefined): string {
  if (!content) return '<p></p>';
  const trimmed = content.trim();
  if (trimmed.startsWith('<')) return trimmed;
  try {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        hiringManager?: string;
        opening?: string;
        body?: string[];
        closing?: string;
      };
      const paragraphs: string[] = [];
      if (parsed.hiringManager) paragraphs.push(`<p>Dear ${parsed.hiringManager},</p>`);
      if (parsed.opening) paragraphs.push(`<p>${parsed.opening}</p>`);
      (parsed.body ?? []).forEach((p) => paragraphs.push(`<p>${p}</p>`));
      if (parsed.closing) paragraphs.push(`<p>${parsed.closing}</p>`);
      return paragraphs.join('') || '<p></p>';
    }
  } catch {
    // fall through
  }
  return (
    trimmed
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => `<p>${l}</p>`)
      .join('') || '<p></p>'
  );
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-transparent' },
  ready: {
    label: 'Ready',
    className:
      'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  },
  exported: {
    label: 'Exported',
    className:
      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  },
};

export function CoverLetterEditorView({
  application,
  drafts: initialDrafts,
  activeDraft: initialDraft,
  aiConfigs,
}: {
  application: ApplicationDetail;
  drafts: CoverLetterDraft[];
  activeDraft: CoverLetterDraft | null;
  aiConfigs: Config[];
}) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [activeDraft, setActiveDraft] = useState(initialDraft);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>(
    aiConfigs.find((c) => c.isDefault)?.providerId ?? aiConfigs[0]?.providerId ?? ''
  );
  const [isPending, startTransition] = useTransition();
  const { exportCoverLetter, isExporting } = useExport();

  const {
    generate,
    isLoading: isGenerating,
    error: genError,
  } = useCoverLetterGeneration(application.id);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
    ],
    content: normalizeToHtml(initialDraft?.content),
    onUpdate: ({ editor: e }) => {
      if (!activeDraft) return;
      debouncedSave(activeDraft.id, e.getHTML());
    },
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedSave = useCallback((draftId: string, content: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateCoverLetterContent(draftId, content);
    }, 1500);
  }, []);

  if (!activeDraft) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
        <FileText className="h-10 w-10 opacity-30" />
        <p className="text-sm">No cover letter draft found.</p>
      </div>
    );
  }

  function handleDraftsUpdate(newDrafts: CoverLetterDraft[], newActiveId?: string) {
    setDrafts(newDrafts);
    if (newActiveId) {
      const found = newDrafts.find((d) => d.id === newActiveId);
      if (found) {
        setActiveDraft(found);
        editor?.commands.setContent(normalizeToHtml(found.content));
      }
    }
  }

  function handleToneChange(tone: 'professional' | 'confident' | 'warm') {
    setActiveDraft((prev) => (prev ? { ...prev, tone } : prev));
    startTransition(async () => {
      try {
        await updateCoverLetterTone(activeDraft!.id, tone);
      } catch {
        toast.error('Failed to update tone');
      }
    });
  }

  function handleHiringManagerBlur(value: string) {
    startTransition(async () => {
      try {
        await updateHiringManager(activeDraft!.id, value);
      } catch {
        toast.error('Failed to update');
      }
    });
  }

  function handleMarkReady() {
    startTransition(async () => {
      try {
        await markCoverLetterReady(activeDraft!.id);
        setActiveDraft((prev) => (prev ? { ...prev, status: 'ready' } : prev));
        toast.success('Cover letter marked as ready!');
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
        await revertCoverLetterToDraft(activeDraft!.id);
        setActiveDraft((prev) => (prev ? { ...prev, status: 'draft' } : prev));
        toast.success('Reverted to draft');
      } catch {
        toast.error('Failed to revert');
      }
    });
  }

  async function handleGenerate() {
    if (!selectedProvider) return;
    await generate(activeDraft!.tone, selectedProvider, activeDraft!.id);
    const updated = await listCoverLetterDrafts(application.id);
    const refreshed = updated.find((d) => d.id === activeDraft!.id);
    if (refreshed) {
      setActiveDraft(refreshed);
      editor?.commands.setContent(normalizeToHtml(refreshed.content));
    }
    handleDraftsUpdate(updated, activeDraft!.id);
  }

  function handleExport() {
    if (!activeDraft) return;
    exportCoverLetter(activeDraft.id).catch((e) => toast.error(e.message));
  }

  const hasProvider = aiConfigs.length > 0;
  const statusBadge = STATUS_BADGE[activeDraft.status] ?? STATUS_BADGE.draft;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-0">
      {/* ── Top action bar ── */}
      <div className="flex items-center gap-2 pb-4 flex-wrap">
        <Link href={`/applications/${application.id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Draft picker */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="sm" className="gap-1 font-medium max-w-45" />}
          >
            <span className="truncate">{activeDraft.name}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            {drafts.map((d) => (
              <DropdownMenuItem
                key={d.id}
                onClick={() => {
                  if (d.id === activeDraft.id) return;
                  startTransition(async () => {
                    await setActiveCoverLetterDraft(d.id, application.id);
                    handleDraftsUpdate(drafts, d.id);
                  });
                }}
                className="gap-2"
              >
                <span className="flex-1 truncate">{d.name}</span>
                {d.isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSheetOpen(true)}
          className="text-muted-foreground"
          aria-label="Manage drafts"
        >
          <FolderOpen className="h-4 w-4" />
        </Button>

        {/* Status badge */}
        <Badge variant="outline" className={statusBadge.className}>
          {statusBadge.label}
        </Badge>

        <div className="flex-1" />

        {/* AI button */}
        {hasProvider && (
          <Button
            variant={showAiPanel ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowAiPanel(!showAiPanel)}
            className="gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Write with AI
          </Button>
        )}

        {/* Mark ready / revert */}
        {activeDraft.status === 'ready' ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevert}
            disabled={isPending}
            className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/20"
          >
            <Check className="h-3.5 w-3.5" />
            Ready
            <RotateCcw className="h-3 w-3 opacity-50" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleMarkReady} disabled={isPending} className="gap-1.5">
            <Check className="h-3.5 w-3.5" />
            Mark Ready
          </Button>
        )}

        {/* Export */}
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          onClick={handleExport}
          className="gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          {isExporting ? 'Exporting…' : 'Export'}
        </Button>
      </div>

      {/* ── AI generation panel ── */}
      {showAiPanel && (
        <div className="rounded-xl border bg-linear-to-br from-primary/5 to-accent/10 p-4 mb-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium">Generate Cover Letter</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Tone:</span>
            <ToneSelector value={activeDraft.tone} onChange={handleToneChange} />
            <div className="flex-1" />
            <Select
              value={selectedProvider}
              onValueChange={(v) => {
                if (v) setSelectedProvider(v);
              }}
            >
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                {aiConfigs.map((c) => (
                  <SelectItem key={c.providerId} value={c.providerId}>
                    {PROVIDER_REGISTRY.find((p) => p.id === c.providerId)?.name ?? c.providerId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={!selectedProvider || isGenerating}
              className="gap-1.5"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAiPanel(false)}>
              Cancel
            </Button>
          </div>
          {genError && <p className="text-xs text-destructive">{genError}</p>}
        </div>
      )}

      {/* ── Document card ── */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Document meta bar */}
        <div className="px-8 pt-6 pb-4 border-b bg-muted/20">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cover Letter
              </p>
              <p className="font-semibold text-foreground truncate">
                {application.vacancy?.jobTitle ?? 'Position'}{' '}
                {application.vacancy?.companyName && (
                  <span className="font-normal text-muted-foreground">
                    · {application.vacancy.companyName}
                  </span>
                )}
              </p>
            </div>
            {/* Tone selector (non-AI flow) */}
            {!showAiPanel && (
              <div className="shrink-0">
                <ToneSelector value={activeDraft.tone} onChange={handleToneChange} />
              </div>
            )}
          </div>

          {/* Hiring manager line */}
          <div className="mt-4 flex items-baseline gap-1.5 text-sm">
            <span className="text-muted-foreground shrink-0">To:</span>
            <Input
              value={activeDraft.hiringManager ?? ''}
              onChange={(e) =>
                setActiveDraft((prev) => (prev ? { ...prev, hiringManager: e.target.value } : prev))
              }
              onBlur={(e) => handleHiringManagerBlur(e.target.value)}
              placeholder="Hiring Manager"
              className="h-7 border-0 border-b rounded-none px-1 focus-visible:ring-0 text-sm bg-transparent w-56"
            />
          </div>
        </div>

        {/* Formatting toolbar */}
        <div className="flex items-center gap-0.5 px-6 py-1.5 border-b bg-muted/10">
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 ${editor?.isActive('bold') ? 'bg-accent text-accent-foreground' : ''}`}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            aria-label="Bold"
          >
            <BoldIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 ${editor?.isActive('italic') ? 'bg-accent text-accent-foreground' : ''}`}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            aria-label="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Editor body */}
        <div
          className="cl-editor px-8 py-8 min-h-96 cursor-text"
          onClick={() => editor?.commands.focus()}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Draft sheet */}
      <CoverLetterDraftSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        applicationId={application.id}
        drafts={drafts}
        activeDraftId={activeDraft.id}
        onUpdate={handleDraftsUpdate}
      />
    </div>
  );
}
