'use client';

import { cn } from '@/lib/utils';
import { ApplicationStatusValues, type ApplicationStatus } from '@/lib/validations/applications';

const statusActiveColors: Record<string, string> = {
  saved: 'bg-slate-500 text-white dark:bg-slate-600',
  planned: 'bg-blue-500 text-white dark:bg-blue-600',
  applied: 'bg-purple-500 text-white dark:bg-purple-600',
  screening: 'bg-yellow-500 text-white dark:bg-yellow-600',
  interview: 'bg-orange-500 text-white dark:bg-orange-600',
  offer: 'bg-green-500 text-white dark:bg-green-600',
  rejected: 'bg-red-500 text-white dark:bg-red-600',
  on_hold: 'bg-gray-500 text-white dark:bg-gray-600',
};

function formatStatus(status: string): string {
  return status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusStepper({
  currentStatus,
  onChange,
}: {
  currentStatus: ApplicationStatus;
  onChange: (status: ApplicationStatus) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ApplicationStatusValues.map((status) => {
        const isActive = status === currentStatus;
        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
              isActive
                ? statusActiveColors[status]
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {formatStatus(status)}
          </button>
        );
      })}
    </div>
  );
}
