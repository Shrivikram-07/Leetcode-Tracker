import { motion } from "framer-motion";
import {
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

import EmptyState from "./EmptyState";

export default function RecommendationsCard({ recommendations }) {
  // Mapping icons to recommendation categories
  const icons = {
    balance: AdjustmentsHorizontalIcon,
    consistency: CalendarIcon,
    topics: FireIcon,
    contest: TrophyIcon,
    interview: SparklesIcon
  };

  const colors = {
    balance: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    consistency: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    topics: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    contest: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    interview: "text-rose-500 bg-rose-500/10 border-rose-500/20"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-6"
    >
      <h3 className="text-sm font-semibold text-[var(--text-h)] mb-4 flex items-center gap-2">
        <SparklesIcon className="w-4 h-4 text-[var(--accent)]" />
        AI Personalized Recommendations
      </h3>

      <div className="space-y-4">
        {recommendations && recommendations.length > 0 ? (
          recommendations.map((rec, index) => {
            const Icon = icons[rec.category] || CheckBadgeIcon;
            const styleClass = colors[rec.category] || "text-gray-500 bg-gray-500/10 border-gray-500/20";
            
            return (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                key={rec.id || index}
                className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:shadow-md hover:shadow-black/5 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${styleClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-[var(--text-h)]">{rec.title}</h4>
                  <p className="text-xs text-[var(--text)] leading-relaxed">{rec.description}</p>
                </div>
              </motion.div>
            );
          })
        ) : (
          <EmptyState
            title="No Recommendations Available"
            description="Complete more problems on LeetCode to generate custom learning paths."
            icon={SparklesIcon}
          />
        )}
      </div>
    </motion.div>
  );
}
