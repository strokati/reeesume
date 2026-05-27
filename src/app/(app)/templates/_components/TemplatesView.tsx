'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { TemplatePreviewModal } from '@/components/shared/TemplatePreviewModal';
import { updateResumeDraftTemplate } from '@/server/actions/resume-drafts';
import { toast } from 'sonner';
import type { ResumeData } from '@/lib/templates/types';
import { createElement } from 'react';
import { getTemplate } from '@/lib/templates';

const A4_WIDTH = 793;
const PREVIEW_SCALE = 0.25;
const PREVIEW_HEIGHT = Math.round(A4_WIDTH * 1.414 * PREVIEW_SCALE);

export function TemplatesView({
  templates,
  previewData,
  activeDraftId,
  activeTemplateId,
}: {
  templates: { id: string; name: string; description: string }[];
  previewData: ResumeData;
  activeDraftId: string | null;
  activeTemplateId: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [currentActive, setCurrentActive] = useState(activeTemplateId);

  async function handleUseTemplate(templateId: string) {
    if (!activeDraftId) {
      toast.error('No active resume draft found');
      return;
    }
    try {
      await updateResumeDraftTemplate(activeDraftId, templateId);
      setCurrentActive(templateId);
      toast.success(`Template changed to ${templates.find((t) => t.id === templateId)?.name}`);
    } catch {
      toast.error('Failed to update template');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Templates"
        description="Choose a template for your resume. Previews use your current resume data."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => {
          const tpl = getTemplate(template.id);
          const Component = tpl.component;
          const isActive = currentActive === template.id;

          return (
            <div key={template.id} className="border rounded-xl overflow-hidden bg-card">
              {/* Scaled preview */}
              <div
                className="bg-white overflow-hidden border-b cursor-pointer relative"
                style={{ height: PREVIEW_HEIGHT }}
                onClick={() => setSelected(template.id)}
              >
                <div
                  style={{
                    width: A4_WIDTH,
                    transform: `scale(${PREVIEW_SCALE})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {createElement(Component, { data: previewData })}
                </div>
                <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <span className="text-sm font-medium bg-background/90 px-3 py-1 rounded-md">
                    Preview full size
                  </span>
                </div>
              </div>

              {/* Info bar */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{template.name}</h3>
                    {isActive && <Badge variant="secondary">Selected</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{template.description}</p>
                </div>
                {!isActive && activeDraftId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    Use
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <TemplatePreviewModal
          templateId={selected}
          previewData={previewData}
          isActive={currentActive === selected}
          hasActiveDraft={!!activeDraftId}
          onUse={() => handleUseTemplate(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
