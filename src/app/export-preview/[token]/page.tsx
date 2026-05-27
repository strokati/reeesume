import { consumeRenderData } from '@/lib/export/render-store';
import { getTemplate } from '@/lib/templates';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ResumePreviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const entry = consumeRenderData(token);
  if (!entry) notFound();

  const template = getTemplate(entry.templateId);
  const TemplateComponent = template.component;

  if (entry.type === 'resume-with-cover' && entry.coverLetterHtml) {
    return (
      <>
        <TemplateComponent data={entry.data} />
        <div className="page-break" />
        <div
          className="cover-letter-page"
          dangerouslySetInnerHTML={{ __html: entry.coverLetterHtml }}
        />
      </>
    );
  }

  return <TemplateComponent data={entry.data} />;
}
