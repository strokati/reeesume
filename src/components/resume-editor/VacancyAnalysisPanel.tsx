'use client';

import { useState } from 'react';
import { Lock, Sparkles, Copy, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
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
import { useAnalyzeVacancy, type VacancyAnalysis } from '@/hooks/use-analyze-vacancy';
import { PROVIDER_REGISTRY } from '@/lib/ai/provider-registry';

type Config = { providerId: string; model: string; isDefault: boolean; apiKey: string };

export function VacancyAnalysisPanel({
  applicationId,
  configs,
  existingAnalysis,
}: {
  applicationId: string;
  configs: Config[];
  existingAnalysis: unknown;
}) {
  const { analyze, analysis, isLoading, error } = useAnalyzeVacancy(applicationId);
  const [selectedProvider, setSelectedProvider] = useState<string>(
    configs.find((c) => c.isDefault)?.providerId ?? configs[0]?.providerId ?? ''
  );
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [wantsReanalyze, setWantsReanalyze] = useState(false);

  const hasProvider = configs.length > 0;
  const displayAnalysis = analysis ?? (existingAnalysis as VacancyAnalysis | null) ?? null;

  const handleAnalyze = (providerId: string) => {
    setWantsReanalyze(false);
    analyze(providerId);
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
              <h3 className="text-sm font-medium text-foreground">AI Analysis</h3>
              <p className="text-xs">
                Configure an AI provider in Settings to unlock vacancy analysis
              </p>
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
            AI Analysis
          </h3>
          {!isLoading && !displayAnalysis && !wantsReanalyze && (
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
                onClick={() => handleAnalyze(selectedProvider)}
                disabled={!selectedProvider}
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                Analyze
              </Button>
            </div>
          )}

          {!isLoading && displayAnalysis && !wantsReanalyze && (
            <div className="flex items-center justify-end">
              <Button size="sm" variant="outline" onClick={() => setWantsReanalyze(true)}>
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Re-Analyze
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
                onClick={() => handleAnalyze(selectedProvider)}
                disabled={!selectedProvider}
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                Analyze
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

        {isLoading && <AnalysisSkeleton />}

        {displayAnalysis && !isLoading && (
          <AnalysisResult
            analysis={displayAnalysis}
            onCopied={setCopiedKeyword}
            copiedKeyword={copiedKeyword}
          />
        )}
      </CardContent>
    </Card>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 animate-pulse" />
        Analyzing job posting...
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="flex flex-wrap gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-5 w-20 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function AnalysisResult({
  analysis,
  onCopied,
  copiedKeyword,
}: {
  analysis: VacancyAnalysis;
  onCopied: (k: string | null) => void;
  copiedKeyword: string | null;
}) {
  function copyKeyword(keyword: string) {
    navigator.clipboard.writeText(keyword);
    onCopied(keyword);
    setTimeout(() => onCopied(null), 1500);
  }

  return (
    <div className="space-y-4">
      {analysis.summary && <p className="text-sm leading-relaxed">{analysis.summary}</p>}

      {analysis.responsibilities?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Responsibilities
          </h4>
          <ul className="space-y-1">
            {analysis.responsibilities.map((r, i) => (
              <li key={i} className="text-sm flex items-start gap-1.5">
                <span className="text-muted-foreground mt-0.5">•</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.mustHaves?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Must Haves
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {analysis.mustHaves.map((item, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-[0.7rem] border-red-200 text-red-700 dark:border-red-800 dark:text-red-300"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {analysis.niceToHaves?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Nice to Haves
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {analysis.niceToHaves.map((item, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-[0.7rem] border-yellow-200 text-yellow-700 dark:border-yellow-800 dark:text-yellow-300"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {analysis.atsKeywords?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            ATS Keywords
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {analysis.atsKeywords.map((kw, i) => (
              <button
                key={i}
                type="button"
                onClick={() => copyKeyword(kw)}
                className="inline-flex items-center gap-1 rounded-full border border-blue-200 px-2 py-0.5 text-[0.7rem] text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 transition-colors"
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
      )}

      {(analysis.tone || analysis.companyCulture) && (
        <div className="space-y-2">
          {analysis.tone && (
            <div className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground shrink-0 w-20">Tone</span>
              <span>{analysis.tone}</span>
            </div>
          )}
          {analysis.companyCulture && (
            <div className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground shrink-0 w-20">Culture</span>
              <span>{analysis.companyCulture}</span>
            </div>
          )}
        </div>
      )}

      {analysis.masterResumeMatchPreview && (
        <div className="space-y-2 pt-2 border-t">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Master Resume Match
          </h4>
          {analysis.masterResumeMatchPreview.relevant?.length > 0 && (
            <div className="space-y-1">
              {analysis.masterResumeMatchPreview.relevant.map((item, i) => (
                <div key={i} className="flex items-start gap-1.5 text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          )}
          {analysis.masterResumeMatchPreview.gaps?.length > 0 && (
            <div className="space-y-1">
              {analysis.masterResumeMatchPreview.gaps.map((item, i) => (
                <div key={i} className="flex items-start gap-1.5 text-sm">
                  <AlertCircle className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
