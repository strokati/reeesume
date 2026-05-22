'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteProject } from '@/server/actions/master-resume';
import { ProjectDialog } from './ProjectDialog';
import { Pencil, Trash2, GripVertical, ExternalLink } from 'lucide-react';
import type { Project } from '@prisma/client';

export function ProjectCard({ project, resumeId, dragHandleProps }: { project: Project; resumeId: string; dragHandleProps?: Record<string, unknown> }) {
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		startTransition(async () => {
			try { await deleteProject(project.id); toast.success('Project deleted'); }
			catch { toast.error('Failed to delete'); }
		});
	}

	const techs = (project.technologies as string[] | null) ?? [];
	const dateRange = [project.startDate, project.endDate ?? 'Ongoing'].filter(Boolean).join(' – ');

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
					<div className="flex items-center gap-2 min-w-0">
						{dragHandleProps && <span {...dragHandleProps} className="cursor-grab touch-none text-muted-foreground hover:text-foreground"><GripVertical className="h-4 w-4" /></span>}
						<span className="font-medium truncate">{project.name}</span>
						{project.role && <span className="text-sm text-muted-foreground truncate">{project.role}</span>}
						{dateRange && <span className="text-xs text-muted-foreground">{dateRange}</span>}
					</div>
					<div className="flex items-center gap-1 shrink-0">
						{project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" title="GitHub"><ExternalLink className="h-3 w-3" /></a>}
						{project.url && <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><ExternalLink className="h-3 w-3" /></a>}
						<Button variant="ghost" size="icon-sm" onClick={() => setEditOpen(true)}><Pencil className="h-3 w-3" /></Button>
						{confirmDelete ? (
							<><Button variant="destructive" size="xs" onClick={handleDelete} disabled={isPending}>Yes</Button><Button variant="ghost" size="xs" onClick={() => setConfirmDelete(false)}>No</Button></>
						) : (
							<Button variant="ghost" size="icon-sm" onClick={() => setConfirmDelete(true)}><Trash2 className="h-3 w-3" /></Button>
						)}
					</div>
				</CardHeader>
				<CardContent className="px-3 pb-3 pt-0 space-y-1 text-sm">
					{project.description && <p className="text-muted-foreground line-clamp-2">{project.description}</p>}
					{techs.length > 0 && (
						<div className="flex flex-wrap gap-1">{techs.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div>
					)}
				</CardContent>
			</Card>
			<ProjectDialog open={editOpen} onOpenChange={setEditOpen} resumeId={resumeId} project={project} />
		</>
	);
}
