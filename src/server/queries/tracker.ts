import { db } from '@/lib/db/client';

export type TrackerRow = {
  id: string;
  jobTitle: string;
  companyName: string;
  salaryMin: number | null;
  salaryMax: number | null;
  proposedSalary: number | null;
  currency: string | null;
  location: string | null;
  status: string;
  dateSaved: Date;
  dateApplied: Date | null;
  interviewDate: Date | null;
  offerDate: Date | null;
  rejectedDate: Date | null;
  excitement: number | null;
  resumeStatus: 'ready' | 'draft' | 'none';
  resumeAtsScore: number | null;
  coverLetterStatus: 'ready' | 'draft' | 'none';
  coverLetterTone: string | null;
  vacancyId: string;
  sourceUrl: string | null;
  notes: { id: string; content: string; createdAt: Date }[];
};

export async function getTrackerData(userId: string): Promise<TrackerRow[]> {
  const applications = await db.application.findMany({
    where: { vacancy: { userId } },
    include: {
      vacancy: {
        select: {
          id: true,
          jobTitle: true,
          companyName: true,
          location: true,
          sourceUrl: true,
          currency: true,
        },
      },
      resumeDrafts: {
        where: { isActive: true },
        select: { status: true, atsScore: true },
        take: 1,
      },
      coverLetterDrafts: {
        where: { isActive: true },
        select: { status: true, tone: true },
        take: 1,
      },
      notes: {
        select: { id: true, content: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { dateSaved: 'desc' },
  });

  return applications.map((app) => {
    const activeResume = app.resumeDrafts[0];
    const activeCover = app.coverLetterDrafts[0];

    let resumeStatus: TrackerRow['resumeStatus'] = 'none';
    if (activeResume) {
      resumeStatus =
        activeResume.status === 'ready' || activeResume.status === 'exported' ? 'ready' : 'draft';
    }

    let coverLetterStatus: TrackerRow['coverLetterStatus'] = 'none';
    if (activeCover) {
      coverLetterStatus =
        activeCover.status === 'ready' || activeCover.status === 'exported' ? 'ready' : 'draft';
    }

    const atsData = activeResume?.atsScore as { score?: number } | null;

    return {
      id: app.id,
      jobTitle: app.vacancy.jobTitle,
      companyName: app.vacancy.companyName,
      salaryMin: app.salaryMin,
      salaryMax: app.salaryMax,
      proposedSalary: app.proposedSalary,
      currency: app.vacancy.currency,
      location: app.vacancy.location,
      status: app.status,
      dateSaved: app.dateSaved,
      dateApplied: app.dateApplied,
      interviewDate: app.interviewDate,
      offerDate: app.offerDate,
      rejectedDate: app.rejectedDate,
      excitement: app.excitement,
      resumeStatus,
      resumeAtsScore: atsData?.score ?? null,
      coverLetterStatus,
      coverLetterTone: activeCover?.tone ?? null,
      vacancyId: app.vacancy.id,
      sourceUrl: app.vacancy.sourceUrl,
      notes: app.notes,
    };
  });
}
