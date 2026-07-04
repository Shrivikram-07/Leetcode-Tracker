import { motion } from "framer-motion";
import { ArrowUpRightIcon, ArrowDownRightIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import EmptyState from "./EmptyState";

export default function StrengthWeaknessCard({ strongAreas, weakAreas }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Strong Areas */}
      <div>
        <h4 className="text-sm font-semibold text-[var(--text-h)] mb-4 flex items-center gap-2">
          <ArrowUpRightIcon className="w-4 h-4 text-emerald-500" />
          Top Topics (Strengths)
        </h4>
        <div className="space-y-2">
          {strongAreas && strongAreas.length > 0 ? (
            strongAreas.map((topic, i) => (
              <div
                key={topic}
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]"
              >
                <span className="text-xs font-semibold text-[var(--text-h)]">{topic}</span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                  Level {5 - i}
                </span>
              </div>
            ))
          ) : (
            <EmptyState
              title="No Skill Statistics"
              description="Solve problems on LeetCode to categorize your strengths."
              icon={AcademicCapIcon}
            />
          )}
        </div>
      </div>

      {/* Weak Areas */}
      <div>
        <h4 className="text-sm font-semibold text-[var(--text-h)] mb-4 flex items-center gap-2">
          <ArrowDownRightIcon className="w-4 h-4 text-red-500" />
          Needs Improvement Topics
        </h4>
        <div className="space-y-2">
          {weakAreas && weakAreas.length > 0 ? (
            weakAreas.map((topic) => (
              <div
                key={topic}
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]"
              >
                <span className="text-xs font-semibold text-[var(--text-h)]">{topic}</span>
                <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full uppercase">
                  Focus Area
                </span>
              </div>
            ))
          ) : (
            <EmptyState
              title="No Skills Available"
              description="Topics solved on LeetCode will categorize your weaknesses."
              icon={AcademicCapIcon}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
