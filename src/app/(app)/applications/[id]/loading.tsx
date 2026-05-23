import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function ApplicationDetailLoading() {
	return (
		<div className="space-y-6">
			<div className="space-y-1 pb-2">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-4 w-40" />
			</div>
			<div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
				<div className="space-y-4">
					<Card>
						<CardContent className="p-5 space-y-4">
							<div className="flex gap-2">
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-5 w-20" />
							</div>
							<Skeleton className="h-4 w-48" />
							<Skeleton className="h-40 w-full" />
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-5 space-y-3">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-10 w-40" />
						</CardContent>
					</Card>
				</div>
				<div className="space-y-4">
					<Card><CardContent className="p-5"><Skeleton className="h-4 w-20 mb-3" /><Skeleton className="h-8 w-full" /></CardContent></Card>
					<Card><CardContent className="p-5"><Skeleton className="h-4 w-20 mb-3" /><Skeleton className="h-6 w-32" /></CardContent></Card>
					<Card><CardContent className="p-5 space-y-2"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></CardContent></Card>
					<Card><CardContent className="p-5 space-y-3"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
				</div>
			</div>
		</div>
	);
}
