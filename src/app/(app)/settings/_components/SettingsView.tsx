'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { AiProvidersPanel } from '@/components/ai/AiProvidersPanel';

type SavedConfig = {
  providerId: string;
  model: string;
  apiKey: string;
  isDefault: boolean;
  baseUrl?: string | null;
};

export function SettingsView({ configs, authMode }: { configs: SavedConfig[]; authMode: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your AI providers and app preferences." />

      <Tabs defaultValue="ai-providers">
        <TabsList>
          <TabsTrigger value="ai-providers">AI Providers</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-providers" className="mt-4">
          <AiProvidersPanel configs={configs} />
        </TabsContent>

        <TabsContent value="general" className="mt-4">
          <div className="rounded-xl bg-card p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center text-muted-foreground">
            General settings will be available in a future update.
          </div>
        </TabsContent>

        <TabsContent value="deployment" className="mt-4">
          <div className="rounded-xl bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-4">
            <h3 className="text-sm font-semibold">Deployment Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Auth Mode</span>
                <span className="font-mono">
                  {authMode === 'none' ? 'Local (no auth)' : 'Self-hosted (Email OTP)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Session Duration</span>
                <span className="font-mono">30 days</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
