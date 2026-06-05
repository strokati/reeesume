'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteWorkProject } from '@/server/actions/master-resume';
import { WorkProjectDialog } from './WorkProjectDialog';
import { Pencil, Trash2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkCompanyWithRoles } from '@/types/master-resume';

type WorkProject = WorkCompanyWithRoles['roles'][number]['projects'][number];

export function WorkProjectCard({ project, roleId }: { project: WorkProject; roleId: string }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteWorkProject(project.id);
        toast.success('Project deleted');
        router.refresh();
      } catch {
        toast.error('Failed to delete project');
      }
    });
  }

  const techs = (project.technologies as string[] | null) ?? [];
  const responsibilities = (project.responsibilities as string[] | null) ?? [];

  return (
    <>
      <Card className="border-dashed">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={() => setCollapsed(!collapsed)}>
              <ChevronDown
                className={cn('h-3 w-3 transition-transform', collapsed && '-rotate-90')}
              />
            </Button>
            <span className="text-sm font-medium">{project.name}</span>
            {project.startDate && (
              <span className="text-xs text-muted-foreground">
                {project.startDate}
                {project.endDate ? ` – ${project.endDate}` : ' – Present'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-3 w-3" />
            </Button>
            {confirmDelete ? (
              <>
                <Button variant="destructive" size="xs" onClick={handleDelete} disabled={isPending}>
                  Yes
                </Button>
                <Button variant="ghost" size="xs" onClick={() => setConfirmDelete(false)}>
                  No
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="icon-sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        {!collapsed && (
          <CardContent className="px-3 pb-3 pt-0 space-y-1 text-sm">
            {project.description && <p>{project.description}</p>}
            {responsibilities.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mt-1 mb-0.5">
                  Responsibilities
                </p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {project.contribution && (
              <p className="text-muted-foreground">
                <span className="font-medium">Contribution:</span> {project.contribution}
              </p>
            )}
            {project.outcome && (
              <p className="text-muted-foreground">
                <span className="font-medium">Outcome:</span> {project.outcome}
              </p>
            )}
            {techs.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {techs.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
      <WorkProjectDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        roleId={roleId}
        project={project}
      />
    </>
  );
}
