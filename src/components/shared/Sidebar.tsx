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
    <aside className="flex w-60 flex-col border-r bg-sidebar">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <FileText className="h-4 w-4" />
        </div>
        <span className="text-base font-semibold tracking-tight">MasterResume</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 pt-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'w-full justify-start gap-3 rounded-xl px-3',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 text-xs text-muted-foreground">v1.0</div>
    </aside>
  );
}
