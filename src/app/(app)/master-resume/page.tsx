import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import {
	getOrCreateMasterResume,
	getWorkExperience,
	getEducation,
	getSkills,
	getCertifications,
	getAwards,
	getProjects,
	getVolunteeringRoles,
	getPublications,
} from '@/server/queries/master-resume';
import { MasterResumeView } from './_components/MasterResumeView';

export const dynamic = 'force-dynamic';

export default async function MasterResumePage() {
	const session = await auth();
	if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
	const userId = session?.user?.id ?? 'local-user';

	const resume = await getOrCreateMasterResume(userId);
	const [companies, education, skills, certifications, awards, projects, volunteeringRoles, publications] =
		await Promise.all([
			getWorkExperience(resume.id),
			getEducation(resume.id),
			getSkills(resume.id),
			getCertifications(resume.id),
			getAwards(resume.id),
			getProjects(resume.id),
			getVolunteeringRoles(resume.id),
			getPublications(resume.id),
		]);

	return (
		<MasterResumeView
			resume={resume}
			companies={companies}
			education={education}
			skills={skills}
			certifications={certifications}
			awards={awards}
			projects={projects}
			volunteeringRoles={volunteeringRoles}
			publications={publications}
		/>
	);
}
