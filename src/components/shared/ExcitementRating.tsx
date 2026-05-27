'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ExcitementRating({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5 hover:scale-110 transition-transform"
        >
          <Star
            className={cn(
              'h-5 w-5',
              star <= (value ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
            )}
          />
        </button>
      ))}
    </div>
  );
}
