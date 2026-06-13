'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteEducation } from '@/server/actions/master-resume';
import { EducationDialog } from './EducationDialog';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import type { Education } from '@/generated/prisma/client';

export function EducationCard({
  education,
  resumeId,
  dragHandleProps,
}: {
  education: Education;
  resumeId: string;
  dragHandleProps?: Record<string, unknown>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteEducation(education.id);
        toast.success('Education deleted');
      } catch {
        toast.error('Failed to delete education');
      }
    });
  }

  const activities = (education.activities as string[] | null) ?? [];
  const dateRange = [education.startDate, education.endDate ?? 'Present']
    .filter(Boolean)
    .join(' – ');

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
          <div className="flex items-center gap-2 min-w-0">
            {dragHandleProps && (
              <span
                {...dragHandleProps}
                className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
              >
                <GripVertical className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0">
              <span className="font-medium">{education.institution}</span>
              {(education.degree || education.field) && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {[education.degree, education.field].filter(Boolean).join(' in ')}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {education.honors && (
              <Badge variant="secondary" className="text-xs mr-1">
                {education.honors}
              </Badge>
            )}
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
        <CardContent className="px-3 pb-3 pt-0 text-sm space-y-1">
          {(education.location || dateRange) && (
            <div className="flex flex-wrap gap-x-3 text-muted-foreground">
              {education.location && <span>{education.location}</span>}
              {dateRange && <span>{dateRange}</span>}
              {education.gpa && <span>GPA: {education.gpa}</span>}
            </div>
          )}
          {activities.length > 0 && (
            <ul className="list-disc pl-4 space-y-0.5">
              {activities.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <EducationDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        resumeId={resumeId}
        education={education}
      />
    </>
  );
}
