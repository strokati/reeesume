import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { getApplicationById } from '@/server/queries/applications';
import { getAiProviderConfigs } from '@/server/queries/settings';
import { getMasterResumes } from '@/server/queries/master-resume';
import { ApplicationDetailView } from './_components/ApplicationDetailView';

export const dynamic = 'force-dynamic';

export default async function ApplicationDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await auth();
	if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
	const userId = session?.user?.id ?? 'local-user';

	const { id } = await params;
	const [application, aiConfigs, resumes] = await Promise.all([
		getApplicationById(id, userId),
		getAiProviderConfigs(userId),
		getMasterResumes(userId),
	]);

	if (!application) notFound();

	return <ApplicationDetailView application={application} aiConfigs={aiConfigs} resumes={resumes} />;
}
