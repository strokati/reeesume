'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ApplicationStatusValues } from '@/lib/validations/applications';
import { updateApplicationStatus } from '@/server/actions/applications';
import { KanbanCard } from './KanbanCard';
import type { TrackerRow } from '@/server/queries/tracker';

const statusColors: Record<string, string> = {
  saved: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  applied: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  screening: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  interview: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  offer: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  on_hold: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const statusLabels: Record<string, string> = {
  saved: 'Saved',
  planned: 'Planned',
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  on_hold: 'On Hold',
};

const columnAccent: Record<string, string> = {
  saved: 'border-t-slate-400 dark:border-t-slate-500',
  planned: 'border-t-blue-400 dark:border-t-blue-500',
  applied: 'border-t-purple-400 dark:border-t-purple-500',
  screening: 'border-t-yellow-400 dark:border-t-yellow-500',
  interview: 'border-t-orange-400 dark:border-t-orange-500',
  offer: 'border-t-green-400 dark:border-t-green-500',
  rejected: 'border-t-red-400 dark:border-t-red-500',
  on_hold: 'border-t-gray-400 dark:border-t-gray-500',
};

const statusSet = new Set<string>(ApplicationStatusValues);
const statusOrder = ApplicationStatusValues;

function DraggableCard({
  row,
  onCardClick,
}: {
  row: TrackerRow;
  onCardClick: (row: TrackerRow) => void;
}) {
  const { listeners, attributes, setNodeRef, transform, isDragging } = useDraggable({
    id: row.id,
  });

  const style: React.CSSProperties = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 1 }
    : {};

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <KanbanCard row={row} onClick={() => onCardClick(row)} isDragging={isDragging} />
    </div>
  );
}

function DroppableColumn({
  status,
  rows,
  onCardClick,
}: {
  status: string;
  rows: TrackerRow[];
  onCardClick: (row: TrackerRow) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 w-[280px] flex flex-col rounded-lg border-t-2 bg-muted/30',
        columnAccent[status] ?? 'border-t-slate-400',
        isOver && 'bg-muted/60'
      )}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <Badge
          className={cn('text-[0.65rem] border-0', statusColors[status] ?? statusColors.saved)}
        >
          {statusLabels[status] ?? status}
        </Badge>
        <span className="text-xs text-muted-foreground">{rows.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-[80px]">
        {rows.length === 0 ? (
          <div className="flex items-center justify-center h-20 rounded-md border-2 border-dashed border-muted-foreground/20">
            <span className="text-xs text-muted-foreground/50">Drag here</span>
          </div>
        ) : (
          rows.map((row) => <DraggableCard key={row.id} row={row} onCardClick={onCardClick} />)
        )}
      </div>
    </div>
  );
}

export function TrackerKanban({
  rows,
  onCardClick,
}: {
  rows: TrackerRow[];
  onCardClick: (row: TrackerRow) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Map<string, string>>(new Map());

  // Apply optimistic status overrides on top of parent rows
  const effectiveRows = useMemo(() => {
    if (overrides.size === 0) return rows;
    return rows.map((r) => {
      const override = overrides.get(r.id);
      return override ? { ...r, status: override } : r;
    });
  }, [rows, overrides]);

  const rowsByStatus = useMemo(() => {
    const map: Record<string, TrackerRow[]> = {};
    for (const status of statusOrder) map[status] = [];
    for (const row of effectiveRows) {
      if (!map[row.status]) map[row.status] = [];
      map[row.status].push(row);
    }
    return map;
  }, [effectiveRows]);

  const activeRow = activeId ? (effectiveRows.find((r) => r.id === activeId) ?? null) : null;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = useCallback((event: { active: { id: string | number } }) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
      const applicationId = String(event.active.id);
      setActiveId(null);

      const targetId = event.over?.id ? String(event.over.id) : null;
      if (!targetId) return;

      // Target might be a card (card id) or a column (status string)
      const targetRow = effectiveRows.find((r) => r.id === targetId);
      const newStatus = targetRow ? targetRow.status : targetId;
      if (!statusSet.has(newStatus)) return;

      const row = effectiveRows.find((r) => r.id === applicationId);
      if (!row || row.status === newStatus) return;

      // Optimistic: store the override
      setOverrides((prev) => {
        const next = new Map(prev);
        next.set(applicationId, newStatus);
        return next;
      });

      updateApplicationStatus(applicationId, { status: newStatus });
    },
    [effectiveRows]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statusOrder.map((status) => (
          <DroppableColumn
            key={status}
            status={status}
            rows={rowsByStatus[status] ?? []}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeRow ? (
          <div className="w-[264px]">
            <KanbanCard row={activeRow} onClick={() => undefined} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
