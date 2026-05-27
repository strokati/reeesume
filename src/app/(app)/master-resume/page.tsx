import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { getOrCreateDefaultMasterResume } from '@/server/queries/master-resume';

export const dynamic = 'force-dynamic';

export default async function MasterResumeRootPage() {
  const session = await auth();
  if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
  const userId = session?.user?.id ?? 'local-user';

  const resume = await getOrCreateDefaultMasterResume(userId);
  redirect(`/master-resume/${resume.id}`);
}
