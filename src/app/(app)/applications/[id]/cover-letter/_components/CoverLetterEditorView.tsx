'use client';

import { useState, useCallback, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import { ArrowLeft, FolderOpen, Sparkles, Check, RotateCcw, Bold as BoldIcon, Italic, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToneSelector } from '@/components/cover-letter-editor/ToneSelector';
import { CoverLetterDraftSheet } from '@/components/cover-letter-editor/CoverLetterDraftSheet';
import {
	updateCoverLetterContent,
	updateCoverLetterTone,
	updateHiringManager,
	setActiveCoverLetterDraft,
	markCoverLetterReady,
	revertCoverLetterToDraft,
} from '@/server/actions/cover-letters';
import { useCoverLetterGeneration } from '@/hooks/use-cover-letter-generation';
import { PROVIDER_REGISTRY } from '@/lib/ai/providers';
import { toast } from 'sonner';
import type { ApplicationDetail } from '@/types/applications';
import type { CoverLetterDraft } from '@prisma/client';

type Config = { providerId: string; model: string; isDefault: boolean; apiKey: string };

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
		aiConfigs.find((c) => c.isDefault)?.providerId ?? aiConfigs[0]?.providerId ?? '',
	);
	const [isPending, startTransition] = useTransition();

	const { generate, isLoading: isGenerating, error: genError } = useCoverLetterGeneration(application.id);

	const editor = useEditor({
		extensions: [StarterKit.configure({ heading: false, bulletList: false, orderedList: false, blockquote: false, codeBlock: false, horizontalRule: false }), Bold],
		content: initialDraft?.content || '<p></p>',
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
			<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
				<p>No cover letter draft found.</p>
			</div>
		);
	}

	function handleDraftsUpdate(newDrafts: CoverLetterDraft[], newActiveId?: string) {
		setDrafts(newDrafts);
		if (newActiveId) {
			const found = newDrafts.find((d) => d.id === newActiveId);
			if (found) {
				setActiveDraft(found);
				editor?.commands.setContent(found.content || '<p></p>');
			}
		}
	}

	function handleToneChange(tone: 'professional' | 'confident' | 'warm') {
		setActiveDraft((prev) => prev ? { ...prev, tone } : prev);
		startTransition(async () => {
			try { await updateCoverLetterTone(activeDraft!.id, tone); }
			catch { toast.error('Failed to update tone'); }
		});
	}

	function handleHiringManagerBlur(value: string) {
		startTransition(async () => {
			try { await updateHiringManager(activeDraft!.id, value); }
			catch { toast.error('Failed to update'); }
		});
	}

	function handleMarkReady() {
		startTransition(async () => {
			try {
				await markCoverLetterReady(activeDraft!.id);
				setActiveDraft((prev) => prev ? { ...prev, status: 'ready' } : prev);
				toast.success('Cover letter marked as ready!');
				confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors: ['#22c55e', '#16a34a', '#4ade80'] });
			} catch { toast.error('Failed to mark as ready'); }
		});
	}

	function handleRevert() {
		startTransition(async () => {
			try {
				await revertCoverLetterToDraft(activeDraft!.id);
				setActiveDraft((prev) => prev ? { ...prev, status: 'draft' } : prev);
				toast.success('Reverted to draft');
			} catch { toast.error('Failed to revert'); }
		});
	}

	async function handleGenerate() {
		if (!selectedProvider) return;
		await generate(activeDraft!.tone, selectedProvider, activeDraft!.id);
		const { getCoverLetterDrafts } = await import('@/server/queries/cover-letters');
		const updated = await getCoverLetterDrafts(application.id);
		handleDraftsUpdate(updated, activeDraft!.id);
	}

	const hasProvider = aiConfigs.length > 0;

	return (
		<div className="max-w-3xl mx-auto space-y-4">
			{/* Toolbar */}
			<div className="flex items-center gap-3 flex-wrap">
				<Link href={`/applications/${application.id}`}>
					<Button variant="ghost" size="sm">
						<ArrowLeft className="h-4 w-4 mr-1" />
						Back
					</Button>
				</Link>

				<DropdownMenu>
					<DropdownMenuTrigger>
						<Button variant="outline" size="sm" className="min-w-[120px] justify-between">
							<span className="truncate">{activeDraft.name}</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-56">
						{drafts.map((d) => (
							<DropdownMenuItem key={d.id} onClick={() => {
								if (d.id === activeDraft.id) return;
								startTransition(async () => {
									await setActiveCoverLetterDraft(d.id, application.id);
									handleDraftsUpdate(drafts, d.id);
								});
							}}>
								{d.name} {d.isActive && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				<Button variant="ghost" size="sm" onClick={() => setSheetOpen(true)}>
					<FolderOpen className="h-4 w-4" />
				</Button>

				<div className="flex-1" />

				<ToneSelector value={activeDraft.tone} onChange={handleToneChange} />

				{hasProvider && (
					<Button variant="outline" size="sm" onClick={() => setShowAiPanel(!showAiPanel)}>
						<Sparkles className="h-4 w-4 mr-1" />
						Write with AI
					</Button>
				)}

				{activeDraft.status === 'ready' ? (
					<Button variant="outline" size="sm" onClick={handleRevert} disabled={isPending} className="text-green-700 border-green-200 hover:bg-green-50 dark:text-green-300 dark:border-green-800">
						<Check className="h-4 w-4 mr-1" />Ready<RotateCcw className="h-3 w-3 ml-1.5 opacity-50" />
					</Button>
				) : (
					<Button size="sm" onClick={handleMarkReady} disabled={isPending}>
						<Check className="h-4 w-4 mr-1" />Mark Ready
					</Button>
				)}

				<Button variant="outline" size="sm" disabled title="Export coming soon">
					<Download className="h-4 w-4 mr-1" />Export
				</Button>
			</div>

			{/* AI Generation panel */}
			{showAiPanel && (
				<div className="rounded-xl border bg-muted/30 p-4 space-y-3">
					<div className="flex items-center gap-3">
						<span className="text-sm font-medium">Generate with AI</span>
						<Select value={selectedProvider} onValueChange={(v) => { if (v) setSelectedProvider(v); }}>
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
						<Button size="sm" onClick={handleGenerate} disabled={!selectedProvider || isGenerating}>
							{isGenerating ? 'Generating...' : 'Generate'}
						</Button>
						<Button variant="ghost" size="sm" onClick={() => setShowAiPanel(false)}>Cancel</Button>
					</div>
					{genError && <p className="text-sm text-red-600">{genError}</p>}
					{isGenerating && <p className="text-xs text-muted-foreground">Writing cover letter...</p>}
				</div>
			)}

			{/* Hiring manager */}
			<div className="text-sm text-muted-foreground flex items-center gap-1.5">
				Dear{' '}
				<Input
					value={activeDraft.hiringManager ?? ''}
					onChange={(e) => setActiveDraft((prev) => prev ? { ...prev, hiringManager: e.target.value } : prev)}
					onBlur={(e) => handleHiringManagerBlur(e.target.value)}
					placeholder="Hiring Manager"
					className="h-6 w-40 text-sm border-0 border-b rounded-none px-1 focus-visible:ring-0"
				/>,
			</div>

			{/* Formatting bar */}
			<div className="flex items-center gap-1 border rounded-t-xl px-2 py-1 bg-muted/30">
				<Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => editor?.chain().focus().toggleBold().run()} data-active={editor?.isActive('bold')}>
					<BoldIcon className="h-4 w-4" />
				</Button>
				<Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => editor?.chain().focus().toggleItalic().run()} data-active={editor?.isActive('italic')}>
					<Italic className="h-4 w-4" />
				</Button>
			</div>

			{/* Editor */}
			<div
				className="ProseMirror-wrapper min-h-[400px] rounded-b-xl border border-t-0 p-6 focus-within:ring-1 focus-within:ring-primary focus-within:outline-none"
				onClick={() => editor?.commands.focus()}
			>
				<EditorContent editor={editor} />
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
