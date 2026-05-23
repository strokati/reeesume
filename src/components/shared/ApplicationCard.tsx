'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Star, MapPin, Calendar, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { updateExcitement } from '@/server/actions/applications';
import type { ApplicationWithVacancy } from '@/types/applications';

const statusColors: Record<string, string> = {
	saved: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
	planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
	applied: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
	screening: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
	interview: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
	offer: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
	rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
	on_hold: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

function formatStatus(status: string): string {
	return status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(date: Date | string): string {
	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

export function ApplicationCard({ application }: { application: ApplicationWithVacancy }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const { vacancy } = application;

	function handleStarClick(excitement: number) {
		startTransition(async () => {
			await updateExcitement(application.id, { excitement });
		});
	}

	return (
		<Card
			className="cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow"
			onClick={() => router.push(`/applications/${application.id}`)}
		>
			<CardContent className="p-5">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2 flex-wrap">
							<span className="font-semibold truncate">{vacancy.companyName}</span>
							<Badge
								className={cn(
									'text-[0.65rem] border-0 shrink-0',
									statusColors[application.status] ?? statusColors.saved,
								)}
							>
								{formatStatus(application.status)}
							</Badge>
						</div>
						<p className="text-sm text-foreground mt-0.5">{vacancy.jobTitle}</p>
						<div className="flex items-center gap-3 mt-2.5 text-xs text-muted-foreground">
							{vacancy.location && (
								<span className="flex items-center gap-1">
									<MapPin className="h-3 w-3" />
									{vacancy.location}
									{vacancy.locationType && ` · ${vacancy.locationType}`}
								</span>
							)}
							<span className="flex items-center gap-1">
								<Calendar className="h-3 w-3" />
								{formatDate(application.dateSaved)}
							</span>
							{(application._count.resumeDrafts > 0 || application._count.coverLetterDrafts > 0) && (
								<span className="flex items-center gap-1">
									<FileText className="h-3 w-3" />
									{application._count.resumeDrafts}R{' '}
									{application._count.coverLetterDrafts}C
								</span>
							)}
						</div>
					</div>

					<div
						className="flex items-center gap-0.5 shrink-0"
						onClick={(e) => e.stopPropagation()}
					>
						{[1, 2, 3, 4, 5].map((star) => (
							<button
								key={star}
								type="button"
								disabled={isPending}
								onClick={() => handleStarClick(star)}
								className="p-0.5 hover:scale-110 transition-transform"
							>
								<Star
									className={cn(
										'h-4 w-4',
										star <= (application.excitement ?? 0)
											? 'fill-yellow-400 text-yellow-400'
											: 'text-muted-foreground/30',
									)}
								/>
							</button>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
