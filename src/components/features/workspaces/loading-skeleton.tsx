/**
 * LoadingSkeleton Component
 * Skeleton loading state for workspace page
 */

export function LoadingSkeleton() {
  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-border bg-card p-6 animate-pulse"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
              <div className="size-6 rounded-full bg-muted" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            </div>

            {/* Button */}
            <div className="h-10 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
