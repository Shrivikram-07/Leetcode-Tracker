import { motion } from "framer-motion";
import { TrophyIcon } from "@heroicons/react/24/outline";
import EmptyState from "./EmptyState";

function ContestStat({ label, value }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
      <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text)]">
        {label}
      </span>
      <span className="text-2xl font-extrabold text-[var(--text-h)]">
        {value ?? <span className="text-base font-medium text-[var(--text)]">—</span>}
      </span>
    </div>
  );
}

export default function ContestCard({ contest, delay = 0 }) {
  const hasData =
    contest &&
    (contest.contestRating || contest.contestGlobalRanking || contest.contestAttend);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-5"
    >
      <h3 className="text-sm font-semibold text-[var(--text-h)] mb-4 flex items-center gap-2">
        <TrophyIcon className="w-4 h-4 text-[var(--accent)]" />
        Contest Performance
      </h3>

      {!hasData ? (
        <EmptyState
          title="No Contest History Yet"
          description="Participate in your first LeetCode contest to unlock contest analytics."
          icon={TrophyIcon}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <ContestStat
            label="Rating"
            value={
              contest.contestRating
                ? Math.round(contest.contestRating)
                : null
            }
          />
          <ContestStat
            label="Global Rank"
            value={
              contest.contestGlobalRanking
                ? `#${contest.contestGlobalRanking.toLocaleString()}`
                : null
            }
          />
          <ContestStat
            label="Contests"
            value={contest.contestAttend ?? null}
          />
          <ContestStat
            label="Top %"
            value={
              contest.contestTopPercentage
                ? `${contest.contestTopPercentage.toFixed(1)}%`
                : null
            }
          />
        </div>
      )}
    </motion.div>
  );
}
