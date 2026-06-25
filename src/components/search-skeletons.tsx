/**
 * Skeleton placeholders for search results while loading.
 */

export function ResultSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-muted" />
        <div className="h-3 w-40 rounded bg-muted" />
      </div>
      <div className="h-5 w-3/4 rounded bg-muted" />
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
      </div>
    </div>
  );
}

export function ResultListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }, (_, i) => (
        <ResultSkeleton key={i} />
      ))}
    </div>
  );
}

export function ImageGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg bg-muted"
          style={{ paddingBottom: `${60 + Math.random() * 40}%` }}
        />
      ))}
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="animate-pulse flex gap-3 rounded-lg border border-border p-3">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
      </div>
      <div className="h-16 w-24 flex-shrink-0 rounded bg-muted" />
    </div>
  );
}

export function NewsListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="animate-pulse flex gap-3 rounded-lg border border-border p-3">
      <div className="h-20 w-32 flex-shrink-0 rounded bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-3 w-20 rounded bg-muted" />
      </div>
    </div>
  );
}

export function VideoListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-muted" />
        ))}
      </div>
    </div>
  );
}
