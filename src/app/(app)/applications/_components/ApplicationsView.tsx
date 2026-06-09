'use client';

import { Briefcase } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ApplicationCard } from '@/components/shared/ApplicationCard';
import { NewApplicationButton } from '@/components/shared/NewApplicationButton';
import type { ApplicationWithVacancy } from '@/types/applications';
import type { MasterResumeSummary } from '@/types/master-resume';

export function ApplicationsView({
  initialData,
  resumes,
}: {
  initialData: ApplicationWithVacancy[];
  resumes: MasterResumeSummary[];
}) {
  const applications = initialData;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Track your job applications from saved to offer."
        action={<NewApplicationButton resumes={resumes} />}
      />

      {applications.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-8 w-8" />}
          title="No applications yet"
          description="Start by adding your first job application. You can paste a job posting for AI analysis."
          action={<NewApplicationButton resumes={resumes} />}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}
