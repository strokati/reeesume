import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { getAiProviderConfigs } from '@/server/queries/settings';
import { SettingsView } from './_components/SettingsView';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await auth();
  if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
  const userId = session?.user?.id ?? 'local-user';

  const configs = await getAiProviderConfigs(userId);
  const authMode = process.env.AUTH_MODE ?? 'none';

  return <SettingsView configs={configs} authMode={authMode} />;
}
