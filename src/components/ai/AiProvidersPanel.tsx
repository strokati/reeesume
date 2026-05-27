'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Settings, Trash2, Star, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AiStatusBadge } from '@/components/ai/AiStatusBadge';
import { AiProviderDialog } from '@/components/ai/AiProviderDialog';
import { deleteAiProviderConfig, setDefaultAiProvider } from '@/server/actions/settings';
import { PROVIDER_REGISTRY } from '@/lib/ai/providers';

type SavedConfig = {
  providerId: string;
  model: string;
  apiKey: string;
  isDefault: boolean;
  baseUrl?: string | null;
};

export function AiProvidersPanel({ configs }: { configs: SavedConfig[] }) {
  return (
    <div className="space-y-2">
      {PROVIDER_REGISTRY.map((provider) => {
        const config = configs.find((c) => c.providerId === provider.id);
        return (
          <ProviderRow
            key={provider.id}
            providerId={provider.id}
            name={provider.name}
            configured={!!config}
            config={config ?? null}
          />
        );
      })}
    </div>
  );
}

function ProviderRow({
  providerId,
  name,
  configured,
  config,
}: {
  providerId: string;
  name: string;
  configured: boolean;
  config: SavedConfig | null;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteAiProviderConfig(providerId);
        toast.success(`${name} configuration removed`);
      } catch {
        toast.error('Failed to delete configuration');
      }
    });
  }

  function handleSetDefault() {
    startTransition(async () => {
      try {
        await setDefaultAiProvider(providerId);
        toast.success(`${name} set as default`);
      } catch {
        toast.error('Failed to set default');
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
          {name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{name}</span>
            <AiStatusBadge configured={configured} isDefault={config?.isDefault ?? false} />
          </div>
          {config && <p className="text-xs text-muted-foreground mt-0.5">{config.model}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {configured && !config?.isDefault && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleSetDefault}
            disabled={isPending}
            title="Set as default"
          >
            <Star className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" onClick={() => setDialogOpen(true)}>
          {configured ? <Pencil className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
        </Button>
        {configured && (
          <Button variant="ghost" size="icon-sm" onClick={handleDelete} disabled={isPending}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>

      <AiProviderDialog
        providerId={providerId}
        existingConfig={config}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
