export default function LoadingSkeleton({ rows = 1, className = "" }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-3 mb-4">
          <div className="h-4 bg-[var(--border)] rounded-full w-3/4" />
          <div className="h-4 bg-[var(--border)] rounded-full w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-5 animate-pulse ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--border)]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-[var(--border)] rounded-full w-1/2" />
          <div className="h-5 bg-[var(--border)] rounded-full w-1/3" />
        </div>
      </div>
      <div className="h-2 bg-[var(--border)] rounded-full w-full" />
    </div>
  );
}

export function SkeletonChart({ className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-5 animate-pulse ${className}`}
    >
      <div className="h-4 bg-[var(--border)] rounded-full w-1/3 mb-6" />
      <div className="flex items-end gap-3 h-40 justify-around">
        {[60, 90, 45, 75, 55].map((h, i) => (
          <div
            key={i}
            className="bg-[var(--border)] rounded-t-lg flex-1"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
