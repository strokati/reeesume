'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const levels = [
  { value: 'Beginner', color: 'bg-gray-400' },
  { value: 'Intermediate', color: 'bg-yellow-500' },
  { value: 'Expert', color: 'bg-green-500' },
] as const;

function levelColor(level?: string | null) {
  return levels.find((l) => l.value === level)?.color ?? 'bg-gray-300';
}

export { levelColor };

export function SkillLevelSelect({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('h-2 w-2 rounded-full', levelColor(value))} />
      <Select value={value ?? ''} onValueChange={onChange}>
        <SelectTrigger
          size="sm"
          className="h-6 w-auto min-w-24 text-xs border-none shadow-none px-1"
        >
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          {levels.map((l) => (
            <SelectItem key={l.value} value={l.value}>
              <span className="flex items-center gap-1.5">
                <span className={cn('h-2 w-2 rounded-full', l.color)} />
                {l.value}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
