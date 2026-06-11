import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { getMasterResumes, getOrCreateDefaultMasterResume } from '@/server/queries/master-resume';
import { MasterResumesView } from './_components/MasterResumesView';

export const dynamic = 'force-dynamic';

export default async function MasterResumeRootPage() {
  const session = await auth();
  if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
  const userId = session?.user?.id ?? 'local-user';

  await getOrCreateDefaultMasterResume(userId);
  const resumes = await getMasterResumes(userId);

  return <MasterResumesView resumes={resumes} />;
}
