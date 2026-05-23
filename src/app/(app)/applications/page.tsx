import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { getApplications } from '@/server/queries/applications';
import { ApplicationsView } from './_components/ApplicationsView';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage() {
	const session = await auth();
	if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
	const userId = session?.user?.id ?? 'local-user';

	const applications = await getApplications(userId);

	return <ApplicationsView initialData={applications} />;
}
