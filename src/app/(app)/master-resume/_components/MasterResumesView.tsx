'use client';

import { FileText } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { MasterResumeCard } from '@/components/master-resume/MasterResumeCard';
import { NewResumeButton } from '@/components/master-resume/NewResumeButton';
import type { MasterResumeSummary } from '@/types/master-resume';

export function MasterResumesView({ resumes }: { resumes: MasterResumeSummary[] }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Resumes"
        description="Your complete career profiles — one per language or market."
        action={<NewResumeButton />}
      />

      {resumes.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="No resumes yet"
          description="Create your first master resume to build your career profile."
          action={<NewResumeButton />}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <MasterResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}
    </div>
  );
}
