'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, FolderOpen, Download, FileText, FileDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DraftSelector } from '@/components/resume-editor/DraftSelector';
import { DraftManagerSheet } from '@/components/resume-editor/DraftManagerSheet';
import { MarkReadyButton } from '@/components/resume-editor/MarkReadyButton';
import { TemplatePicker } from '@/components/resume-editor/TemplatePicker';
import { ResumeEditorLeft } from '@/components/resume-editor/ResumeEditorLeft';
import { RightPanelTabs } from '@/components/resume-editor/RightPanelTabs';
import type { ApplicationDetail } from '@/types/applications';
import type { ResumeDraft } from '@/generated/prisma/client';
import { useExport } from '@/hooks/use-export';
import { toast } from 'sonner';
import { syncWorkExperienceFromMaster } from '@/server/actions/resume-drafts';

type Config = { providerId: string; model: string; isDefault: boolean; apiKey: string };

export function ResumeEditorView({
  application,
  drafts: initialDrafts,
  activeDraft: initialDraft,
  aiConfigs,
}: {
  application: ApplicationDetail;
  drafts: ResumeDraft[];
  activeDraft: ResumeDraft | null;
  aiConfigs: Config[];
}) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [activeDraft, setActiveDraftState] = useState(initialDraft);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [isSyncing, startSync] = useTransition();
  const { exportResume, isExporting } = useExport();

  function handleDraftSwitch(draft: ResumeDraft) {
    setActiveDraftState(draft);
    setEditorKey((k) => k + 1);
  }

  function handleDraftsUpdate(newDrafts: ResumeDraft[], newActiveId?: string) {
    setDrafts(newDrafts);
    if (newActiveId) {
      const found = newDrafts.find((d) => d.id === newActiveId);
      if (found) {
        setActiveDraftState(found);
        setEditorKey((k) => k + 1);
      }
    }
  }

  function handleSyncFromMaster() {
    if (!activeDraft) return;
    startSync(async () => {
      try {
        const newContent = await syncWorkExperienceFromMaster(activeDraft.id);
        setActiveDraftState((prev) =>
          prev ? { ...prev, content: newContent as unknown as typeof prev.content } : prev
        );
        setEditorKey((k) => k + 1);
        toast.success('Work experience synced from Master Resume');
      } catch {
        toast.error('Failed to sync from master');
      }
    });
  }

  if (!activeDraft) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>No resume draft found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* TopBar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href={`/applications/${application.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>

        <DraftSelector
          applicationId={application.id}
          drafts={drafts}
          activeDraft={activeDraft}
          onSwitch={handleDraftSwitch}
          onDraftsUpdate={handleDraftsUpdate}
        />

        <Button variant="ghost" size="sm" onClick={() => setSheetOpen(true)}>
          <FolderOpen className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSyncFromMaster}
          disabled={isSyncing}
          title="Sync work experience from Master Resume"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
        </Button>

        <div className="flex-1" />

        <TemplatePicker draftId={activeDraft.id} currentTemplateId={activeDraft.templateId} />

        <MarkReadyButton draftId={activeDraft.id} status={activeDraft.status} />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline" size="sm" disabled={isExporting} />}
          >
            <Download className="h-4 w-4 mr-1" />
            {isExporting ? 'Exporting...' : 'Export'}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                exportResume(activeDraft.id, 'pdf').catch((e) => toast.error(e.message))
              }
            >
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                exportResume(activeDraft.id, 'docx').catch((e) => toast.error(e.message))
              }
            >
              <FileDown className="h-4 w-4 mr-2" />
              Download DOCX
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                exportResume(activeDraft.id, 'pdf', true).catch((e) => toast.error(e.message))
              }
            >
              <FileText className="h-4 w-4 mr-2" />
              Download PDF + Cover Letter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
        <ResumeEditorLeft key={editorKey} draft={activeDraft} />
        <RightPanelTabs application={application} draft={activeDraft} aiConfigs={aiConfigs} />
      </div>

      {/* Draft Manager Sheet */}
      <DraftManagerSheet
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
