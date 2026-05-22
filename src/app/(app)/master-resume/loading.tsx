import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function MasterResumeLoading() {
	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-72" />
			</div>
			{[1, 2, 3].map((i) => (
				<Card key={i}>
					<CardHeader className="p-4">
						<Skeleton className="h-5 w-36" />
					</CardHeader>
					<CardContent className="px-4 pb-4 pt-0">
						<Skeleton className="h-24 w-full" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}
