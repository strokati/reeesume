'use client';

import { useState } from 'react';
import { Sparkles, ShieldCheck, FileText } from 'lucide-react';
import { SuggestionsPanel } from './SuggestionsPanel';
import { AtsCheckPanel } from './AtsCheckPanel';
import type { ApplicationDetail } from '@/types/applications';
import type { ResumeDraft } from '@prisma/client';

type Config = { providerId: string; model: string; isDefault: boolean; apiKey: string };
type Tab = 'suggestions' | 'ats' | 'job';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
	{ id: 'suggestions', label: 'Suggestions', icon: Sparkles },
	{ id: 'ats', label: 'ATS Check', icon: ShieldCheck },
	{ id: 'job', label: 'Job Posting', icon: FileText },
];

export function RightPanelTabs({
	application,
	draft,
	aiConfigs,
}: {
	application: ApplicationDetail;
	draft: ResumeDraft;
	aiConfigs: Config[];
}) {
	const [activeTab, setActiveTab] = useState<Tab>('suggestions');

	return (
		<div className="space-y-0">
			{/* Tab bar */}
			<div className="flex border-b">
				{TABS.map((tab) => {
					const Icon = tab.icon;
					return (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
								activeTab === tab.id
									? 'border-primary text-primary'
									: 'border-transparent text-muted-foreground hover:text-foreground'
							}`}
						>
							<Icon className="h-3.5 w-3.5" />
							{tab.label}
						</button>
					);
				})}
			</div>

			{/* Tab content */}
			<div className="pt-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
				{activeTab === 'suggestions' && (
					<SuggestionsPanel
						applicationId={application.id}
						configs={aiConfigs}
					/>
				)}
				{activeTab === 'ats' && (
					<AtsCheckPanel
						resumeDraftId={draft.id}
						configs={aiConfigs}
						existingResult={draft.atsScore}
					/>
				)}
				{activeTab === 'job' && (
					<div className="rounded-xl bg-muted/50 p-4">
						{application.vacancy.rawText ? (
							<pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono">
								{application.vacancy.rawText}
							</pre>
						) : (
							<p className="text-sm text-muted-foreground">No job posting text available.</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
