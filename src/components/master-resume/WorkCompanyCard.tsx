'use client';

import { useState, useTransition } from 'react';
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
import { GripVertical, Pencil, Trash2, Plus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkCompanyWithRoles } from '@/types/master-resume';

export function WorkCompanyCard({
  company,
  resumeId,
}: {
  company: WorkCompanyWithRoles;
  resumeId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteWorkCompany(company.id);
        toast.success('Company deleted');
      } catch {
        toast.error('Failed to delete company');
      }
    });
  }

  return (
    <>
      <Card ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-50 shadow-lg')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <Button variant="ghost" size="icon-sm" onClick={() => setExpanded(!expanded)}>
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', !expanded && '-rotate-90')}
              />
            </Button>
            <span className="font-medium truncate">{company.name}</span>
            {company.employmentType && (
              <Badge variant="outline" className="text-xs shrink-0">
                {company.employmentType}
              </Badge>
            )}
            {(company.startDate || company.endDate) && (
              <span className="text-xs text-muted-foreground shrink-0">
                {company.startDate}
                {company.endDate ? ` – ${company.endDate}` : ' – Present'}
              </span>
            )}
            {company.location && (
              <span className="text-xs text-muted-foreground shrink-0">{company.location}</span>
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
        open={editOpen}
        onOpenChange={setEditOpen}
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
