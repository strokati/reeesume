'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Check, X, RotateCcw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useRephrase } from '@/hooks/use-rephrase';

type Direction = 'stronger' | 'concise' | 'quantified' | 'formal' | 'casual';

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: 'stronger', label: 'Stronger' },
  { value: 'concise', label: 'Concise' },
  { value: 'quantified', label: 'Quantified' },
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
];

export function RephrasePopover({
  original,
  context,
  providerId,
  onApply,
  children,
}: {
  original: string;
  context?: string;
  providerId: string;
  onApply: (rephrased: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { rephrase, result, isLoading, error } = useRephrase();

  function handleDirection(direction: Direction) {
    rephrase(original, direction, context ?? '', providerId);
  }

  function handleApply() {
    if (result) {
      onApply(result);
      setOpen(false);
    }
  }

  function handleCancel() {
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        {!result && !isLoading && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Rephrase with AI
            </div>
            <div className="flex flex-wrap gap-1">
              {DIRECTIONS.map((d) => (
                <Button
                  key={d.value}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleDirection(d.value)}
                  disabled={isLoading}
                >
                  {d.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Rephrasing...
          </div>
        )}

        {error && <div className="text-xs text-red-600 py-1">{error}</div>}

        {result && !isLoading && (
          <div className="space-y-2">
            <div className="space-y-1.5">
              <div className="text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[0.6rem] text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  Original
                </span>
              </div>
              <p className="text-xs line-through text-muted-foreground">{original}</p>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs">
                <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[0.6rem] text-orange-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                  AI Suggested
                </span>
              </div>
              <p className="text-sm font-medium">{result}</p>
            </div>
            <div className="flex gap-1.5 pt-1">
              <Button size="sm" className="h-7 text-xs flex-1" onClick={handleApply}>
                <Check className="h-3 w-3 mr-1" />
                Use this
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => rephrase(original, 'stronger', context ?? '', providerId)}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleCancel}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
