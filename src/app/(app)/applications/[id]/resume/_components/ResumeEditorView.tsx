'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DraftSelector } from '@/components/resume-editor/DraftSelector';
import { ResumeEditorLeft } from '@/components/resume-editor/ResumeEditorLeft';
import { RightPanelTabs } from '@/components/resume-editor/RightPanelTabs';
import { markDraftReady } from '@/server/actions/resume-drafts';
import { toast } from 'sonner';
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
	const [isPending, startTransition] = useTransition();

	function handleDraftSwitch(draft: ResumeDraft) {
		setActiveDraftState(draft);
	}

	function handleDraftsUpdate(newDrafts: ResumeDraft[]) {
		setDrafts(newDrafts);
	}

	function handleMarkReady() {
		if (!activeDraft) return;
		startTransition(async () => {
			try {
				await markDraftReady(activeDraft.id);
				toast.success('Draft marked as ready');
			} catch {
				toast.error('Failed to mark draft as ready');
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

				<div className="flex-1" />

				<Button
					variant="outline"
					size="sm"
					onClick={handleMarkReady}
					disabled={isPending || activeDraft.status === 'ready'}
				>
					<Check className="h-4 w-4 mr-1" />
					{activeDraft.status === 'ready' ? 'Ready' : 'Mark Ready'}
				</Button>
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
		</div>
	);
}
