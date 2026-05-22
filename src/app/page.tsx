import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';

export default async function Home() {
	const session = await auth();

	if (!session && process.env.AUTH_MODE === 'email_otp') {
		redirect('/login');
	}

	redirect('/master-resume');
}
