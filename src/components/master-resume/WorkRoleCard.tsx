'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { deleteWorkRole, updateWorkRole } from '@/server/actions/master-resume';
import { WorkRoleDialog } from './WorkRoleDialog';
import { WorkProjectCard } from './WorkProjectCard';
import { WorkProjectDialog } from './WorkProjectDialog';
import { Pencil, Trash2, Plus } from 'lucide-react';
import type { WorkCompanyWithRoles } from '@/types/master-resume';

type WorkRole = WorkCompanyWithRoles['roles'][number];

export function WorkRoleCard({
  role,
  companyId,
  headless = false,
}: {
  role: WorkRole;
  companyId: string;
  /** When true, renders only the body content — no Card wrapper or header row. */
  headless?: boolean;
}) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [responsibilities, setResponsibilities] = useState<string[]>(
    (role.responsibilities as string[] | null) ?? []
  );
  const [achievements, setAchievements] = useState<string[]>(
    (role.achievements as string[] | null) ?? []
  );

  // Re-sync local bullet state when server data changes (e.g. after dialog save + router.refresh)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setResponsibilities((role.responsibilities as string[] | null) ?? []);
  }, [JSON.stringify(role.responsibilities)]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setAchievements((role.achievements as string[] | null) ?? []);
  }, [JSON.stringify(role.achievements)]);
  const [editingIndex, setEditingIndex] = useState<{
    field: 'resp' | 'ach';
    index: number;
  } | null>(null);

  const techs = (role.technologies as string[] | null) ?? [];

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteWorkRole(role.id);
        toast.success('Role deleted');
        router.refresh();
      } catch {
        toast.error('Failed to delete role');
      }
    });
  }

  function saveBullets(field: 'responsibilities' | 'achievements', items: string[]) {
    startTransition(async () => {
      try {
        await updateWorkRole(role.id, { [field]: items.filter((s) => s.trim()) });
      } catch {
        toast.error('Failed to save');
      }
    });
  }

  function addBullet(field: 'resp' | 'ach') {
    const newItems = field === 'resp' ? [...responsibilities, ''] : [...achievements, ''];
    if (field === 'resp') setResponsibilities(newItems);
    else setAchievements(newItems);
    setEditingIndex({ field, index: newItems.length - 1 });
  }

  function updateBullet(field: 'resp' | 'ach', index: number, value: string) {
    if (field === 'resp') {
      const next = [...responsibilities];
      next[index] = value;
      setResponsibilities(next);
    } else {
      const next = [...achievements];
      next[index] = value;
      setAchievements(next);
    }
  }

  function commitBullet(field: 'resp' | 'ach') {
    setEditingIndex(null);
    const items = field === 'resp' ? responsibilities : achievements;
    saveBullets(field === 'resp' ? 'responsibilities' : 'achievements', items);
  }

  // ── Shared body content ────────────────────────────────────────────────────
  const body = (
    <div className="space-y-2">
      {responsibilities.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Responsibilities</p>
          <ul className="list-disc pl-4 space-y-0.5 text-sm">
            {responsibilities.map((item, i) =>
              editingIndex?.field === 'resp' && editingIndex.index === i ? (
                <li key={i}>
                  <Input
                    autoFocus
                    value={item}
                    onChange={(e) => updateBullet('resp', i, e.target.value)}
                    onBlur={() => commitBullet('resp')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitBullet('resp');
                      }
                    }}
                    className="h-6 text-sm"
                  />
                </li>
              ) : (
                <li
                  key={i}
                  onClick={() => setEditingIndex({ field: 'resp', index: i })}
                  className="cursor-pointer hover:text-primary"
                >
                  {item || <span className="italic text-muted-foreground">Click to edit...</span>}
                </li>
              )
            )}
          </ul>
          <Button variant="ghost" size="xs" onClick={() => addBullet('resp')} className="mt-1">
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
      )}

      {achievements.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Achievements</p>
          <ul className="list-disc pl-4 space-y-0.5 text-sm">
            {achievements.map((item, i) =>
              editingIndex?.field === 'ach' && editingIndex.index === i ? (
                <li key={i}>
                  <Input
                    autoFocus
                    value={item}
                    onChange={(e) => updateBullet('ach', i, e.target.value)}
                    onBlur={() => commitBullet('ach')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitBullet('ach');
                      }
                    }}
                    className="h-6 text-sm"
                  />
                </li>
              ) : (
                <li
                  key={i}
                  onClick={() => setEditingIndex({ field: 'ach', index: i })}
                  className="cursor-pointer hover:text-primary"
                >
                  {item || <span className="italic text-muted-foreground">Click to edit...</span>}
                </li>
              )
            )}
          </ul>
          <Button variant="ghost" size="xs" onClick={() => addBullet('ach')} className="mt-1">
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
      )}

      {techs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {techs.map((t) => (
            <Badge key={t} variant="secondary" className="text-xs">
              {t}
            </Badge>
          ))}
        </div>
      )}

      {role.projects.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-xs font-medium text-muted-foreground">Projects</p>
          {role.projects.map((p) => (
            <WorkProjectCard key={p.id} project={p} roleId={role.id} />
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-1 flex-wrap">
        <Button variant="outline" size="xs" onClick={() => setProjectDialogOpen(true)}>
          <Plus className="h-3 w-3 mr-1" /> Add Project
        </Button>
        {responsibilities.length === 0 && achievements.length === 0 && (
          <Button variant="outline" size="xs" onClick={() => addBullet('resp')}>
            <Plus className="h-3 w-3 mr-1" /> Add Responsibilities
          </Button>
        )}
        {(responsibilities.length > 0 || achievements.length > 0) && achievements.length === 0 && (
          <Button variant="ghost" size="xs" onClick={() => addBullet('ach')}>
            <Plus className="h-3 w-3 mr-1" /> Add Achievement
          </Button>
        )}
        {(responsibilities.length > 0 || achievements.length > 0) &&
          responsibilities.length === 0 && (
            <Button variant="ghost" size="xs" onClick={() => addBullet('resp')}>
              <Plus className="h-3 w-3 mr-1" /> Add Responsibility
            </Button>
          )}
      </div>
    </div>
  );

  // ── Headless mode: body only (used inside WorkCompanyCard single-role layout) ─
  if (headless) {
    return (
      <>
        {body}
        <WorkRoleDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          companyId={companyId}
          role={role}
        />
        <WorkProjectDialog
          open={projectDialogOpen}
          onOpenChange={setProjectDialogOpen}
          roleId={role.id}
        />
      </>
    );
  }

  // ── Standalone card (used when company has multiple roles) ──────────────────
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-sm font-medium">{role.title}</span>
            {(role.startDate || role.endDate) && (
              <span className="text-xs text-muted-foreground">
                {role.startDate}
                {role.endDate ? ` – ${role.endDate}` : ' – Present'}
              </span>
            )}
            {role.workArrangement && (
              <Badge variant="outline" className="text-xs shrink-0">
                {role.workArrangement}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
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
        <CardContent className="px-3 pb-3 pt-0">{body}</CardContent>
      </Card>

      <WorkRoleDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        companyId={companyId}
        role={role}
      />
      <WorkProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        roleId={role.id}
      />
    </>
  );
}
