import { Skeleton } from '@/components/ui/skeleton';

export function LocationLoadingSkeleton() {
  return (
    <div className="space-y-2 p-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function NoResultsMessage() {
  return <div className="text-muted-foreground p-3 text-sm">No results found.</div>;
}
