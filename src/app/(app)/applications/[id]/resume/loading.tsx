import { Skeleton } from '@/components/ui/skeleton';

export default function ResumeEditorLoading() {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-8 w-32" />
				<div className="flex-1" />
				<Skeleton className="h-8 w-24" />
				<Skeleton className="h-8 w-24" />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
				<div className="space-y-4">
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-48 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
				<div className="space-y-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		</div>
	);
}
