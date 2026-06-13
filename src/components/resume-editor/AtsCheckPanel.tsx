'use client';

import { useState } from 'react';
import { Lock, Sparkles, Copy, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
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
import { useAtsCheck } from '@/hooks/use-ats-check';
import { PROVIDER_REGISTRY } from '@/lib/ai/provider-registry';
import type { AtsCheckResult } from '@/lib/ai/prompts/ats-check';

type Config = { providerId: string; model: string; isDefault: boolean; apiKey: string };

export function AtsCheckPanel({
  resumeDraftId,
  configs,
  existingResult,
}: {
  resumeDraftId: string;
  configs: Config[];
  existingResult: unknown;
}) {
  const { runCheck, result, isLoading, error } = useAtsCheck(resumeDraftId);
  const [selectedProvider, setSelectedProvider] = useState<string>(
    configs.find((c) => c.isDefault)?.providerId ?? configs[0]?.providerId ?? ''
  );
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [wantsReanalyze, setWantsReanalyze] = useState(false);

  const hasProvider = configs.length > 0;
  const displayResult = result ?? (existingResult as AtsCheckResult | null) ?? null;

  const handleRun = (providerId: string) => {
    setWantsReanalyze(false);
    runCheck(providerId);
  };

  if (!hasProvider) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">ATS Check</h3>
              <p className="text-xs">Configure an AI provider in Settings to unlock ATS checking</p>
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
            ATS Check
          </h3>
          {!isLoading && !displayResult && !wantsReanalyze && (
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
                onClick={() => handleRun(selectedProvider)}
                disabled={!selectedProvider}
              >
                <ShieldCheck className="h-4 w-4 mr-1.5" />
                Run Check
              </Button>
            </div>
          )}

          {!isLoading && displayResult && !wantsReanalyze && (
            <div className="flex items-center justify-end">
              <Button size="sm" variant="outline" onClick={() => setWantsReanalyze(true)}>
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Re-run
              </Button>
            </div>
          )}

          {!isLoading && wantsReanalyze && (
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
                onClick={() => handleRun(selectedProvider)}
                disabled={!selectedProvider}
              >
                <ShieldCheck className="h-4 w-4 mr-1.5" />
                Run Check
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setWantsReanalyze(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {isLoading && <AtsCheckSkeleton />}

        {displayResult && !isLoading && (
          <AtsCheckContent
            result={displayResult}
            copiedKeyword={copiedKeyword}
            onCopied={setCopiedKeyword}
          />
        )}
      </CardContent>
    </Card>
  );
}

function AtsCheckSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 animate-pulse" />
        Running ATS compatibility check...
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}

function AtsCheckContent({
  result,
  copiedKeyword,
  onCopied,
}: {
  result: AtsCheckResult;
  copiedKeyword: string | null;
  onCopied: (k: string | null) => void;
}) {
  function copyKeyword(keyword: string) {
    navigator.clipboard.writeText(keyword);
    onCopied(keyword);
    setTimeout(() => onCopied(null), 1500);
  }

  const scoreColor =
    result.overallScore >= 70
      ? 'text-green-600'
      : result.overallScore >= 40
        ? 'text-yellow-600'
        : 'text-red-600';
  const scoreRing =
    result.overallScore >= 70
      ? 'stroke-green-500'
      : result.overallScore >= 40
        ? 'stroke-yellow-500'
        : 'stroke-red-500';

  const sortedRecommendations = [...(result.recommendations ?? [])].sort((a, b) => {
    const order = { HIGH: 0, MED: 1, LOW: 2 };
    return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
  });

  return (
    <div className="space-y-4">
      {/* Overall score */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-muted" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              className={scoreRing}
              strokeWidth="3"
              strokeDasharray={`${result.overallScore} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className={`absolute text-lg font-bold ${scoreColor}`}>{result.overallScore}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">ATS Score: {result.overallScore}/100</p>
          {result.summary && <p className="text-xs text-muted-foreground mt-1">{result.summary}</p>}
        </div>
      </div>

      {/* Sub-scores */}
      <div className="space-y-2">
        <SubScore label="Keyword Match" score={result.subScores.keywordMatch} />
        <SubScore label="Formatting" score={result.subScores.formatting} />
        <SubScore label="Sections" score={result.subScores.sectionCompleteness} />
        <SubScore label="Readability" score={result.subScores.readability} />
      </div>

      {/* Keywords */}
      {result.keywordCoverage && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex gap-4">
            <div className="flex-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                Found ({result.keywordCoverage.found?.length ?? 0})
              </h4>
              <div className="flex flex-wrap gap-1">
                {result.keywordCoverage.found?.map((kw, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-[0.65rem] border-green-200 text-green-700 dark:border-green-800 dark:text-green-300"
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                Missing ({result.keywordCoverage.missing?.length ?? 0})
              </h4>
              <div className="flex flex-wrap gap-1">
                {result.keywordCoverage.missing?.map((kw, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => copyKeyword(kw)}
                    className="inline-flex items-center gap-1 rounded-full border border-red-200 px-2 py-0.5 text-[0.65rem] text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20 transition-colors"
                  >
                    {kw}
                    {copiedKeyword === kw ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {sortedRecommendations.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recommendations
          </h4>
          <div className="space-y-1.5">
            {sortedRecommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <PriorityDot priority={rec.priority} />
                <div className="min-w-0">
                  <span className="font-medium">{rec.issue}</span>
                  <p className="text-xs text-muted-foreground">{rec.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SubScore({ label, score }: { label: string; score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = clamped >= 70 ? 'bg-green-500' : clamped >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground w-28 shrink-0 text-xs">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{clamped}</span>
    </div>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const color =
    priority === 'HIGH' ? 'bg-red-500' : priority === 'MED' ? 'bg-yellow-500' : 'bg-green-500';

  return <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${color}`} />;
}
