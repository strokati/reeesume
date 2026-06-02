'use client';

import { useTransition } from 'react';
import { Check, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { updateResumeDraftTemplate } from '@/server/actions/resume-drafts';
import { TEMPLATES } from '@/lib/templates';
import { toast } from 'sonner';

const TEMPLATE_LIST = Object.values(TEMPLATES).map((t) => ({
  id: t.id,
  name: t.name,
  description: t.description,
}));

export function TemplatePicker({
  draftId,
  currentTemplateId,
}: {
  draftId: string;
  currentTemplateId: string;
}) {
  const [, startTransition] = useTransition();

  function handleSelect(templateId: string) {
    if (templateId === currentTemplateId) return;
    startTransition(async () => {
      try {
        await updateResumeDraftTemplate(draftId, templateId);
        toast.success('Template updated');
      } catch {
        toast.error('Failed to update template');
      }
    });
  }

  const current = TEMPLATE_LIST.find((t) => t.id === currentTemplateId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <Layout className="h-4 w-4 mr-1.5" />
        {current?.name ?? 'Template'}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {TEMPLATE_LIST.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => handleSelect(t.id)}
            className="flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.description}</p>
            </div>
            {t.id === currentTemplateId && (
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
