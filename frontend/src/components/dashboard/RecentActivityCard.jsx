import { motion } from "framer-motion";
import { ClockIcon } from "@heroicons/react/24/outline";
import EmptyState from "./EmptyState";

const DIFF_COLORS = {
  Easy: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  Hard: "bg-red-500/10 text-red-500 border border-red-500/20",
};

function RecentItem({ sub, index }) {
  const diffClass = DIFF_COLORS[sub.difficulty] ?? "bg-[var(--border)] text-[var(--text)]";

  const dateStr = sub.timestamp
    ? new Date(Number(sub.timestamp) * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center gap-3 py-3 border-b border-[var(--border)] last:border-0 group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-h)] truncate group-hover:text-[var(--accent)] transition-colors duration-200">
          {sub.title ?? "Unknown Problem"}
        </p>
        {dateStr && (
          <p className="text-xs text-[var(--text)] mt-0.5">{dateStr}</p>
        )}
      </div>
      {sub.difficulty && (
        <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${diffClass}`}>
          {sub.difficulty}
        </span>
      )}
    </motion.div>
  );
}

export default function RecentActivityCard({ submissions, delay = 0 }) {
  const list = Array.isArray(submissions) ? submissions.slice(0, 8) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-5"
    >
      <h3 className="text-sm font-semibold text-[var(--text-h)] mb-4 flex items-center gap-2">
        <ClockIcon className="w-4 h-4 text-[var(--accent)]" />
        Recent Activity
      </h3>

      {list.length === 0 ? (
        <EmptyState
          title="No Recent Activity"
          description="Solve problems on LeetCode to see your activity feed."
          icon={ClockIcon}
        />
      ) : (
        <div>
          {list.map((sub, i) => (
            <RecentItem key={`${sub.title}-${i}`} sub={sub} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
