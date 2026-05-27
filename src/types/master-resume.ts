import type { Prisma } from '@prisma/client';

export type MasterResumeSummary = {
	id: string;
	name: string;
	language: string;
	isDefault: boolean;
	updatedAt: Date;
};

export type WorkCompanyWithRoles = Prisma.WorkCompanyGetPayload<{
	include: { roles: { include: { projects: true } } };
}>;

export type FullMasterResume = Prisma.MasterResumeGetPayload<{
	include: {
		workCompanies: { include: { roles: { include: { projects: true } } } };
		educations: true;
		skills: true;
		certifications: true;
		awards: true;
		projects: true;
		volunteeringRoles: true;
		publications: true;
	};
}>;
