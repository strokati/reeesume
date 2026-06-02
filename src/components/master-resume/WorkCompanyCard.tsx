'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteWorkCompany } from '@/server/actions/master-resume';
import { WorkCompanyDialog } from './WorkCompanyDialog';
import { WorkRoleCard } from './WorkRoleCard';
import { WorkRoleDialog } from './WorkRoleDialog';
import { GripVertical, Pencil, Trash2, Plus, ChevronDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkCompanyWithRoles } from '@/types/master-resume';

export function WorkCompanyCard({
  company,
  resumeId,
}: {
  company: WorkCompanyWithRoles;
  resumeId: string;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editCompanyOpen, setEditCompanyOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: company.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteWorkCompany(company.id);
        toast.success('Deleted');
        router.refresh();
      } catch {
        toast.error('Failed to delete');
      }
    });
  }

  const isSingleRole = company.roles.length <= 1;
  const primaryRole = company.roles[0];

  // ── Single-role layout: role title is the primary heading ──────────────────
  if (isSingleRole) {
    return (
      <>
        <Card ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-50 shadow-lg')}>
          {/* Header: role title + company subtitle */}
          <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3">
            <div className="flex items-start gap-2 min-w-0">
              <button
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                className="cursor-grab touch-none text-muted-foreground hover:text-foreground mt-0.5 shrink-0"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                {/* Primary: role title */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm leading-tight">
                    {primaryRole?.title ?? 'Untitled Role'}
                  </span>
                  {primaryRole?.workArrangement && (
                    <Badge variant="outline" className="text-xs">
                      {primaryRole.workArrangement}
                    </Badge>
                  )}
                  {company.employmentType && (
                    <Badge variant="secondary" className="text-xs">
                      {company.employmentType}
                    </Badge>
                  )}
                </div>
                {/* Secondary: company · location · dates */}
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">{company.name}</span>
                  {company.location && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{company.location}</span>
                    </>
                  )}
                  {(primaryRole?.startDate || primaryRole?.endDate) && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {primaryRole.startDate}
                        {primaryRole.endDate ? ` – ${primaryRole.endDate}` : ' – Present'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {primaryRole && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditRoleOpen(true)}
                  title="Edit role"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditCompanyOpen(true)}
                title="Edit company info"
              >
                <Building2 className="h-3 w-3" />
              </Button>
              {confirmDelete ? (
                <>
                  <Button
                    variant="destructive"
                    size="xs"
                    onClick={handleDelete}
                    disabled={isPending}
                  >
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

          {/* Body: role content rendered headless */}
          {primaryRole && (
            <CardContent className="px-3 pb-3 pt-0">
              <WorkRoleCard role={primaryRole} companyId={company.id} headless />
            </CardContent>
          )}
        </Card>

        <WorkCompanyDialog
          open={editCompanyOpen}
          onOpenChange={setEditCompanyOpen}
          resumeId={resumeId}
          company={company}
        />
        {primaryRole && (
          <WorkRoleDialog
            open={editRoleOpen}
            onOpenChange={setEditRoleOpen}
            companyId={company.id}
            role={primaryRole}
          />
        )}
      </>
    );
  }

  // ── Multi-role layout: company name is the group header ───────────────────
  return (
    <>
      <Card ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-50 shadow-lg')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              className="cursor-grab touch-none text-muted-foreground hover:text-foreground shrink-0"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <Button variant="ghost" size="icon-sm" onClick={() => setExpanded(!expanded)}>
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', !expanded && '-rotate-90')}
              />
            </Button>
            <div className="min-w-0">
              <span className="font-semibold text-sm">{company.name}</span>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                {company.employmentType && (
                  <Badge variant="secondary" className="text-xs">
                    {company.employmentType}
                  </Badge>
                )}
                {company.location && (
                  <span className="text-xs text-muted-foreground">{company.location}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon-sm" onClick={() => setEditCompanyOpen(true)}>
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

        {expanded && (
          <CardContent className="px-3 pb-3 pt-0 space-y-2">
            {company.roles.map((role) => (
              <WorkRoleCard key={role.id} role={role} companyId={company.id} />
            ))}
            <Button variant="ghost" size="xs" onClick={() => setRoleDialogOpen(true)}>
              <Plus className="h-3 w-3 mr-1" /> Add Role
            </Button>
          </CardContent>
        )}
      </Card>

      <WorkCompanyDialog
        open={editCompanyOpen}
        onOpenChange={setEditCompanyOpen}
        resumeId={resumeId}
        company={company}
      />
      <WorkRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        companyId={company.id}
      />
    </>
  );
}
