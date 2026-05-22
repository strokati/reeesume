'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { FileText, Briefcase, LayoutDashboard, LayoutTemplate, Settings } from 'lucide-react';

const navItems = [
	{ href: '/master-resume', label: 'Master Resume', icon: FileText },
	{ href: '/applications', label: 'Applications', icon: Briefcase },
	{ href: '/tracker', label: 'Tracker', icon: LayoutDashboard },
	{ href: '/templates', label: 'Templates', icon: LayoutTemplate },
	{ href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className="flex w-60 flex-col border-r bg-muted/40">
			<nav className="flex-1 space-y-1 p-2">
				{navItems.map(({ href, label, icon: Icon }) => {
					const isActive = pathname.startsWith(href);
					return (
						<Link
							key={href}
							href={href}
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								'w-full justify-start gap-2',
								isActive && 'bg-accent text-accent-foreground',
							)}
						>
							<Icon className="h-4 w-4" />
							{label}
						</Link>
					);
				})}
			</nav>
			<div className="p-4 text-xs text-muted-foreground">MasterResume</div>
		</aside>
	);
}
