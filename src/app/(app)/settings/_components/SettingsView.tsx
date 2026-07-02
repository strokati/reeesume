'use client';

import { useState } from 'react';
import { Settings2, Sparkles, Server, Paintbrush, Database } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { AiProvidersPanel } from '@/components/ai/AiProvidersPanel';
import { DataExportPanel } from '@/components/settings/DataExportPanel';
import { PromptsPanel } from './PromptsPanel';

type SavedConfig = {
  providerId: string;
  model: string;
  apiKey: string;
  isDefault: boolean;
  baseUrl?: string | null;
};

type SectionId = 'ai-providers' | 'prompts' | 'appearance' | 'deployment' | 'export-import';

const sections: { id: SectionId; label: string; description: string; icon: React.ElementType }[] = [
  {
    id: 'ai-providers',
    label: 'AI Providers',
    description: 'API keys and models',
    icon: Sparkles,
  },
  {
    id: 'prompts',
    label: 'Prompts',
    description: 'Customize AI behavior',
    icon: Settings2,
  },
  {
    id: 'export-import',
    label: 'Export / Import',
    description: 'Backup and restore',
    icon: Database,
  },
  {
    id: 'appearance',
    label: 'Appearance',
    description: 'Theme and display',
    icon: Paintbrush,
  },
  {
    id: 'deployment',
    label: 'Deployment',
    description: 'Server configuration',
    icon: Server,
  },
];

export function SettingsView({ configs, authMode }: { configs: SavedConfig[]; authMode: string }) {
  const [activeSection, setActiveSection] = useState<SectionId>('ai-providers');

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your AI providers and app preferences." />

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar navigation */}
        <nav className="flex lg:flex-col gap-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors w-full ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-tight">{section.label}</div>
                  <div className="text-xs leading-tight opacity-70">{section.description}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Content area */}
        <div>
          {activeSection === 'ai-providers' && <AiProvidersPanel configs={configs} />}
          {activeSection === 'prompts' && <PromptsPanel />}
          {activeSection === 'export-import' && <DataExportPanel />}
          {activeSection === 'appearance' && <AppearancePlaceholder />}
          {activeSection === 'deployment' && <DeploymentSection authMode={authMode} />}
        </div>
      </div>
    </div>
  );
}

function AppearancePlaceholder() {
  return (
    <div className="rounded-xl bg-card p-12 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center space-y-2">
      <Paintbrush className="h-8 w-8 mx-auto text-muted-foreground/50" />
      <h3 className="text-sm font-medium">Appearance Settings</h3>
      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
        Theme, language, and display preferences will be available in a future update.
      </p>
    </div>
  );
}

function DeploymentSection({ authMode }: { authMode: string }) {
  const items = [
    {
      label: 'Auth Mode',
      value: authMode === 'none' ? 'Local (no auth)' : 'Self-hosted (Email OTP)',
    },
    { label: 'Session Duration', value: '30 days' },
    { label: 'Database', value: 'PostgreSQL 16' },
    { label: 'Framework', value: 'Next.js 15' },
  ];

  return (
    <div className="rounded-xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.06)] divide-y divide-border">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground">{item.label}</span>
          <span className="text-sm font-mono">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
