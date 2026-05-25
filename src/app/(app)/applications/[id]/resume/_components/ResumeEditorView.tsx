'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DraftSelector } from '@/components/resume-editor/DraftSelector';
import { DraftManagerSheet } from '@/components/resume-editor/DraftManagerSheet';
import { MarkReadyButton } from '@/components/resume-editor/MarkReadyButton';
import { TemplatePicker } from '@/components/resume-editor/TemplatePicker';
import { ResumeEditorLeft } from '@/components/resume-editor/ResumeEditorLeft';
import { RightPanelTabs } from '@/components/resume-editor/RightPanelTabs';
import type { ApplicationDetail } from '@/types/applications';
import type { ResumeDraft } from '@prisma/client';

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

	function handleDraftSwitch(draft: ResumeDraft) {
		setActiveDraftState(draft);
	}

	function handleDraftsUpdate(newDrafts: ResumeDraft[], newActiveId?: string) {
		setDrafts(newDrafts);
		if (newActiveId) {
			const found = newDrafts.find((d) => d.id === newActiveId);
			if (found) setActiveDraftState(found);
		}
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

				<div className="flex-1" />

				<TemplatePicker
					draftId={activeDraft.id}
					currentTemplateId={activeDraft.templateId}
				/>

				<MarkReadyButton
					draftId={activeDraft.id}
					status={activeDraft.status}
				/>
			</div>

			{/* Two-panel layout */}
			<div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
				<ResumeEditorLeft draft={activeDraft} />
				<RightPanelTabs
					application={application}
					draft={activeDraft}
					aiConfigs={aiConfigs}
				/>
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
