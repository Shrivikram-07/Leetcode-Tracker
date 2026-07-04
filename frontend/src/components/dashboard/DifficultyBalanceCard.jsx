import { motion } from "framer-motion";
import { ScaleIcon } from "@heroicons/react/24/outline";

export default function DifficultyBalanceCard({ balance }) {
  const { easyPct = 0, mediumPct = 0, hardPct = 0, level = "N/A", explanation = "" } = balance || {};

  const colors = {
    Excellent: "text-emerald-500 bg-emerald-500/10",
    Good: "text-blue-500 bg-blue-500/10",
    "Needs Improvement": "text-red-500 bg-red-500/10",
    "N/A": "text-gray-400 bg-gray-400/10"
  };

  const levelClass = colors[level] || colors["N/A"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-6 flex flex-col justify-between"
    >
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ScaleIcon className="w-4 h-4 text-[var(--accent)]" />
          <h4 className="text-sm font-semibold text-[var(--text-h)]">Difficulty Balance</h4>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${levelClass}`}>
          {level}
        </span>
      </div>

      <div className="space-y-4 my-2">
        {/* Progress Bars */}
        {[
          { label: "Easy", pct: easyPct, color: "bg-emerald-500", text: "text-emerald-500" },
          { label: "Medium", pct: mediumPct, color: "bg-amber-500", text: "text-amber-500" },
          { label: "Hard", pct: hardPct, color: "bg-red-500", text: "text-red-500" }
        ].map(item => (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[var(--text)]">{item.label}</span>
              <span className={`${item.text} font-bold`}>{item.pct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full ${item.color} rounded-full`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-[var(--border)] pt-3">
        <p className="text-xs text-[var(--text)] leading-relaxed">
          {explanation}
        </p>
      </div>
    </motion.div>
  );
}
