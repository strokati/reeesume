'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { upsertAiProviderConfig, testAiConnection } from '@/server/actions/settings';
import { UpsertAiProviderSchema, type UpsertAiProviderInput } from '@/lib/validations/settings';
import { PROVIDER_REGISTRY } from '@/lib/ai/providers';

export function AiProviderDialog({
  providerId,
  existingConfig,
  open,
  onOpenChange,
}: {
  providerId: string;
  existingConfig?: { model: string; baseUrl?: string | null; apiKey: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [model, setModel] = useState(existingConfig?.model ?? '');
  const [formKey, setFormKey] = useState(0);

  const provider = PROVIDER_REGISTRY.find((p) => p.id === providerId);
  const needsBaseUrl = providerId === 'ollama' || providerId === 'custom';
  const hasExistingKey = !!existingConfig?.apiKey && existingConfig.apiKey !== '';

  const form = useForm<Omit<UpsertAiProviderInput, 'providerId'>>({
    resolver: zodResolver(UpsertAiProviderSchema.omit({ providerId: true })),
    defaultValues: {
      apiKey: '',
      model: existingConfig?.model ?? '',
      baseUrl:
        existingConfig?.baseUrl ?? (providerId === 'ollama' ? 'http://localhost:11434/v1' : ''),
      displayName: '',
    },
  });

  const { register, handleSubmit, formState, setValue } = form;

  function onSubmit(data: Omit<UpsertAiProviderInput, 'providerId'>) {
    const payload: UpsertAiProviderInput = {
      ...data,
      providerId,
      model: model || data.model,
    };
    if (hasExistingKey && !payload.apiKey) {
      delete payload.apiKey;
    }
    startTransition(async () => {
      try {
        await upsertAiProviderConfig(payload);
        toast.success(`${provider?.name ?? providerId} configured`);
        onOpenChange(false);
      } catch {
        toast.error('Failed to save configuration');
      }
    });
  }

  function handleTest() {
    setTestResult(null);
    const apiKeyValue = form.getValues('apiKey');
    const baseUrlValue = form.getValues('baseUrl');
    const overrides =
      apiKeyValue || model
        ? {
            apiKey: apiKeyValue || undefined,
            model: model,
            baseUrl: baseUrlValue || undefined,
          }
        : undefined;
    startTransition(async () => {
      const result = await testAiConnection(providerId, overrides);
      setTestResult(result);
    });
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setFormKey((k) => k + 1);
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configure {provider?.name ?? providerId}</DialogTitle>
          <DialogDescription>
            Enter your API key and choose a model. The key is encrypted before storage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" key={formKey}>
          <div className="space-y-1.5">
            <Label htmlFor="apiKey">
              API Key {hasExistingKey ? '(leave empty to keep current)' : '*'}
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={hasExistingKey ? '••••••••' : 'sk-...'}
              {...register('apiKey')}
            />
            {formState.errors.apiKey && (
              <p className="text-xs text-destructive">{formState.errors.apiKey.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Model</Label>
            {provider && provider.models.length > 0 ? (
              <Select
                value={model}
                onValueChange={(v) => {
                  setModel(v ?? '');
                  setValue('model', v ?? '');
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {provider.models.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="e.g. gpt-4o"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  setValue('model', e.target.value);
                }}
              />
            )}
          </div>

          {needsBaseUrl && (
            <div className="space-y-1.5">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                placeholder={
                  providerId === 'ollama'
                    ? 'http://localhost:11434/v1'
                    : 'https://api.example.com/v1'
                }
                {...register('baseUrl')}
              />
            </div>
          )}

          {testResult && (
            <div
              className={`text-sm rounded-xl p-3 ${testResult.success ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}
            >
              {testResult.success ? 'Connection successful!' : testResult.error}
            </div>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleTest} disabled={isPending}>
              Test Connection
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
