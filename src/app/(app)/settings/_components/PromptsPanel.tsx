'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { RotateCcw, Save, FileText, Undo2 } from 'lucide-react';
import {
  getPromptOverrides,
  upsertPromptOverride,
  resetPromptOverride,
  resetAllPromptOverrides,
} from '@/server/actions/prompts';
import {
  getAllPromptTemplates,
  getPromptGroups,
  type PromptTemplate,
} from '@/lib/ai/prompts/defaults';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type OverrideMap = Record<string, string>;

export function PromptsPanel() {
  const groups = getPromptGroups();
  const allTemplates = getAllPromptTemplates();

  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.group ?? '');
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [edited, setEdited] = useState<OverrideMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPromptOverrides()
      .then((rows) => {
        const map: OverrideMap = {};
        for (const row of rows) map[row.promptKey] = row.template;
        setOverrides(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const groupTemplates = allTemplates.filter((t) => t.group === selectedGroup);

  const getEffectiveValue = useCallback(
    (key: string) => edited[key] ?? overrides[key] ?? getTemplateDefault(key),
    [edited, overrides]
  );

  const isModified = useCallback(
    (key: string) => {
      const current = edited[key] ?? overrides[key];
      return current !== undefined && current !== getTemplateDefault(key);
    },
    [edited, overrides]
  );

  const isDirty = useCallback(
    (key: string) =>
      edited[key] !== undefined && edited[key] !== (overrides[key] ?? getTemplateDefault(key)),
    [edited, overrides]
  );

  const hasAnyDirty = Object.keys(edited).some((k) => isDirty(k));

  function handleChange(key: string, value: string) {
    setEdited((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const keys = Object.keys(edited).filter((k) => isDirty(k));
      for (const key of keys) {
        await upsertPromptOverride(key, edited[key]);
      }
      setOverrides((prev) => {
        const next = { ...prev };
        for (const key of keys) next[key] = edited[key];
        return next;
      });
      setEdited({});
      toast.success('Prompts saved');
    } catch {
      toast.error('Failed to save prompts');
    } finally {
      setSaving(false);
    }
  }

  async function handleReset(key: string) {
    try {
      await resetPromptOverride(key);
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setEdited((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      toast.success('Prompt reset to default');
    } catch {
      toast.error('Failed to reset prompt');
    }
  }

  async function handleResetAll() {
    if (!confirm('Reset all prompts to their defaults? This cannot be undone.')) return;
    try {
      await resetAllPromptOverrides();
      setOverrides({});
      setEdited({});
      toast.success('All prompts reset to defaults');
    } catch {
      toast.error('Failed to reset prompts');
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-card p-12 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center text-muted-foreground">
        Loading prompts...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetAll}
            disabled={Object.keys(overrides).length === 0}
            className="text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reset All
          </Button>
          {Object.keys(overrides).length > 0 && (
            <span className="text-xs text-muted-foreground">
              {Object.keys(overrides).length} customized
            </span>
          )}
        </div>
        <Button size="sm" onClick={handleSave} disabled={!hasAnyDirty || saving}>
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Two-column: group nav + editors */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Group nav */}
        <div className="flex lg:flex-col gap-1">
          {groups.map((g) => {
            const groupModified = g.keys.some((k) => isModified(k));
            const groupDirty = g.keys.some((k) => isDirty(k));
            const isActive = selectedGroup === g.group;
            return (
              <button
                key={g.group}
                onClick={() => setSelectedGroup(g.group)}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors w-full ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="truncate">{g.group}</span>
                {groupDirty ? (
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                ) : groupModified ? (
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Editors */}
        <div className="space-y-4">
          {groupTemplates.map((template) => (
            <PromptEditor
              key={template.key}
              template={template}
              value={getEffectiveValue(template.key)}
              isDefault={getEffectiveValue(template.key) === getTemplateDefault(template.key)}
              isModified={isModified(template.key)}
              isDirty={isDirty(template.key)}
              onChange={(value) => handleChange(template.key, value)}
              onReset={() => handleReset(template.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function getTemplateDefault(key: string): string {
  return getAllPromptTemplates().find((t) => t.key === key)?.defaultTemplate ?? '';
}

function PromptEditor({
  template,
  value,
  isDefault,
  isModified,
  isDirty,
  onChange,
  onReset,
}: {
  template: PromptTemplate;
  value: string;
  isDefault: boolean;
  isModified: boolean;
  isDirty: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <div
      className={`rounded-xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden ${
        isDirty ? 'ring-1 ring-primary/30' : isModified ? 'ring-1 ring-muted-foreground/20' : ''
      }`}
    >
      {/* Editor header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-medium">{template.label}</span>
          {isDirty && (
            <span className="text-[0.65rem] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
              Unsaved
            </span>
          )}
          {isModified && !isDirty && (
            <span className="text-[0.65rem] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
              Modified
            </span>
          )}
        </div>
        {!isDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <Undo2 className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Textarea */}
      <div className="p-3">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[200px] font-mono text-xs leading-relaxed border-0 focus-visible:ring-0 p-0 resize-y bg-transparent"
          placeholder="Enter prompt template..."
        />
      </div>

      {/* Variables footer */}
      {template.variables.length > 0 && (
        <div className="px-4 py-2 border-t border-border/50 bg-muted/20">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[0.65rem] text-muted-foreground font-medium uppercase tracking-wider">
              Variables
            </span>
            {template.variables.map((v) => (
              <code
                key={v}
                className="text-[0.65rem] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground"
              >
                {`{{${v}}}`}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
