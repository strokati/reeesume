'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export function SectionCard({
	title,
	action,
	children,
	collapsible = false,
}: {
	title: string;
	action?: React.ReactNode;
	children: React.ReactNode;
	collapsible?: boolean;
}) {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<Card>
			<CardHeader className={cn('flex flex-row items-center justify-between space-y-0 p-4')}>
				<h2 className="text-base font-semibold">{title}</h2>
				<div className="flex items-center gap-2">
					{action}
					{collapsible && (
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={() => setCollapsed(!collapsed)}
						>
							<ChevronDown
								className={cn(
									'h-4 w-4 transition-transform',
									collapsed && '-rotate-90',
								)}
							/>
						</Button>
					)}
				</div>
			</CardHeader>
			{!collapsed && <CardContent className="px-4 pb-4 pt-0">{children}</CardContent>}
		</Card>
	);
}
