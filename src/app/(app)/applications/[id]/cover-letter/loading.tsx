import { Skeleton } from '@/components/ui/skeleton';

export default function CoverLetterLoading() {
	return (
		<div className="space-y-4 max-w-3xl mx-auto">
			<div className="flex items-center gap-4">
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-8 w-64" />
				<div className="flex-1" />
				<Skeleton className="h-8 w-24" />
				<Skeleton className="h-8 w-24" />
			</div>
			<Skeleton className="h-8 w-48" />
			<Skeleton className="h-[500px] w-full rounded-xl" />
		</div>
	);
}
