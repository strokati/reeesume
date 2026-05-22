import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export function Topbar({ title }: { title?: string }) {
	const showSignOut = process.env.AUTH_MODE === 'email_otp';

	return (
		<header className="flex h-14 items-center justify-between border-b px-6">
			{title ? <h1 className="text-lg font-semibold">{title}</h1> : <div />}
			{showSignOut && (
				<form action="/api/auth/signout">
					<button
						type="submit"
						className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
					>
						Sign out
					</button>
				</form>
			)}
		</header>
	);
}
