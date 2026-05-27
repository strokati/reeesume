import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { getTrackerData } from '@/server/queries/tracker';
import { TrackerView } from './_components/TrackerView';

export const dynamic = 'force-dynamic';

export default async function TrackerPage() {
  const session = await auth();
  if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
  const userId = session?.user?.id ?? 'local-user';

  const data = await getTrackerData(userId);

  return <TrackerView initialData={data} />;
}
