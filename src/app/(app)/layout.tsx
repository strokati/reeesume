import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { Sidebar } from '@/components/shared/Sidebar';
import { Topbar } from '@/components/shared/Topbar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	const session = await auth();

	if (!session && process.env.AUTH_MODE === 'email_otp') {
		redirect('/login');
	}

	return (
		<div className="flex h-screen">
			<Sidebar />
			<div className="flex-1 flex flex-col overflow-hidden">
				<Topbar />
				<main className="flex-1 overflow-y-auto p-6">{children}</main>
			</div>
		</div>
	);
}
