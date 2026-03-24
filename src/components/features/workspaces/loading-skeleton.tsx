/**
 * LoadingSkeleton Component
 * Skeleton loading state for workspace page with shimmer animation
 */

export function LoadingSkeleton() {
  return (
    <div className="p-8" role="status" aria-live="polite" aria-label="Loading workspaces">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-border bg-card p-5 overflow-hidden relative"
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="size-9 rounded-lg bg-muted animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                <div className="h-2.5 w-12 bg-muted rounded animate-pulse" />
              </div>
            </div>

            {/* Description placeholder */}
            <div className="h-3 w-3/4 bg-muted rounded animate-pulse mb-auto" />

            {/* Footer */}
            <div className="flex items-center gap-3 pt-3 mt-3 border-t border-border/60">
              <div className="h-3 w-8 bg-muted rounded animate-pulse" />
              <div className="h-3 w-px bg-border" />
              <div className="h-3 w-8 bg-muted rounded animate-pulse" />
              <div className="h-2.5 w-20 bg-muted rounded animate-pulse ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
