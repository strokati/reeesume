import { Skeleton } from '@/components/ui/skeleton';

export default function TrackerLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="rounded-md border">
        <div className="border-b bg-muted/50 p-3">
          <div className="flex gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-b p-3">
            <div className="flex gap-4">
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} className="h-5 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
