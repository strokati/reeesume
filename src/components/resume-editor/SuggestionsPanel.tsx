'use client';

import { useState } from 'react';
import { Lock, Sparkles, CheckCircle2, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useResumeSuggestions } from '@/hooks/use-resume-suggestions';
import { PROVIDER_REGISTRY } from '@/lib/ai/providers';
import type { ResumeSuggestions } from '@/lib/ai/prompts/resume-suggestions';

type Config = { providerId: string; model: string; isDefault: boolean; apiKey: string };

export function SuggestionsPanel({
  applicationId,
  configs,
}: {
  applicationId: string;
  configs: Config[];
}) {
  const { getSuggestions, suggestions, isLoading, error } = useResumeSuggestions(applicationId);
  const [selectedProvider, setSelectedProvider] = useState<string>(
    configs.find((c) => c.isDefault)?.providerId ?? configs[0]?.providerId ?? ''
  );

  const hasProvider = configs.length > 0;

  if (!hasProvider) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">AI Suggestions</h3>
              <p className="text-xs">Configure an AI provider in Settings to unlock suggestions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            AI Suggestions
          </h3>
          {!suggestions && !isLoading && (
            <div className="flex items-center gap-2">
              <Select
                value={selectedProvider}
                onValueChange={(v) => {
                  if (v) setSelectedProvider(v);
                }}
              >
                <SelectTrigger className="h-8 w-40 text-xs">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  {configs.map((c) => (
                    <SelectItem key={c.providerId} value={c.providerId}>
                      {PROVIDER_REGISTRY.find((p) => p.id === c.providerId)?.name ?? c.providerId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={() => getSuggestions(selectedProvider)}
                disabled={!selectedProvider}
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                Generate
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {isLoading && <SuggestionsSkeleton />}

        {suggestions && !isLoading && <SuggestionsContent suggestions={suggestions} />}
      </CardContent>
    </Card>
  );
}

function SuggestionsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 animate-pulse" />
        Analyzing master resume against job posting...
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

function SuggestionsContent({ suggestions }: { suggestions: ResumeSuggestions }) {
  return (
    <div className="space-y-4">
      {/* Summary suggestion */}
      {suggestions.summary && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Suggested Summary
          </h4>
          <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-3 dark:border-orange-800 dark:bg-orange-900/10">
            <p className="text-sm leading-relaxed">{suggestions.summary.suggestion}</p>
            <p className="text-xs text-muted-foreground italic mt-1.5">
              {suggestions.summary.reasoning}
            </p>
          </div>
        </div>
      )}

      {/* Work Experience suggestions */}
      {suggestions.workExperience?.length > 0 && (
        <WorkSuggestions items={suggestions.workExperience} />
      )}

      {/* Skills suggestions */}
      {suggestions.skills?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.skills.map((s, i) => (
              <Badge
                key={i}
                variant={s.include ? 'default' : 'outline'}
                className={`text-[0.7rem] ${s.include ? '' : 'text-muted-foreground'}`}
              >
                {s.include ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {s.skillId.slice(0, 8)}...
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Projects suggestions */}
      {suggestions.projects?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Projects
          </h4>
          {suggestions.projects.map((p, i) => (
            <ProjectSuggestionItem key={i} item={p} />
          ))}
        </div>
      )}

      {/* Section order */}
      {suggestions.sectionOrder?.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Suggested Section Order
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.sectionOrder.map((section, i) => (
              <Badge key={i} variant="outline" className="text-[0.7rem]">
                {i + 1}. {section}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkSuggestions({ items }: { items: ResumeSuggestions['workExperience'] }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Work Experience
      </h4>
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border p-3 space-y-2">
          <button
            type="button"
            className="flex items-center justify-between w-full text-left"
            onClick={() => toggle(i)}
          >
            <div className="flex items-center gap-2">
              {expanded.has(i) ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {item.companyId.slice(0, 8)}... / {item.roleId.slice(0, 8)}...
              </span>
            </div>
            <div className="flex items-center gap-2">
              {item.include ? (
                <Badge className="text-[0.6rem] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  Include
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[0.6rem] text-muted-foreground">
                  Skip
                </Badge>
              )}
              <ScoreBar score={item.relevanceScore} />
            </div>
          </button>
          {expanded.has(i) && (
            <div className="pl-6 space-y-2">
              <p className="text-xs text-muted-foreground italic">{item.reasoning}</p>
              {item.suggestedBullets?.length > 0 && (
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[0.6rem] text-orange-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                    AI Suggested
                  </span>
                  <ul className="space-y-0.5">
                    {item.suggestedBullets.map((bullet, bi) => (
                      <li key={bi} className="text-sm flex items-start gap-1.5">
                        <span className="text-muted-foreground mt-0.5">•</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ProjectSuggestionItem({ item }: { item: ResumeSuggestions['projects'][number] }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-2.5">
      <div className="flex items-center gap-2">
        {item.include ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm">{item.projectId.slice(0, 8)}...</span>
      </div>
      <ScoreBar score={item.relevanceScore} />
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = clamped >= 70 ? 'bg-green-500' : clamped >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-[0.65rem] text-muted-foreground tabular-nums">{clamped}%</span>
    </div>
  );
}
