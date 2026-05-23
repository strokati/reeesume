import type { Prisma } from '@prisma/client';

export type ApplicationWithVacancy = Prisma.ApplicationGetPayload<{
	include: {
		vacancy: true;
		_count: {
			select: {
				resumeDrafts: true;
				coverLetterDrafts: true;
			};
		};
	};
}>;

export type ApplicationDetail = Prisma.ApplicationGetPayload<{
	include: {
		vacancy: true;
		resumeDrafts: {
			orderBy: { createdAt: 'desc' };
		};
		coverLetterDrafts: {
			orderBy: { createdAt: 'desc' };
		};
	};
}>;
