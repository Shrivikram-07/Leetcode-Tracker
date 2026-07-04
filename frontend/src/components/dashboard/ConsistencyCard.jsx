import { motion } from "framer-motion";
import { ArrowPathIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function ConsistencyCard({ consistency, streak }) {
  const { score = 0, level = "N/A" } = consistency || {};

  // Color mappings based on consistency level
  const colors = {
    Excellent: "from-emerald-500 to-teal-500 text-emerald-500 bg-emerald-500/10",
    Good: "from-blue-500 to-indigo-500 text-blue-500 bg-blue-500/10",
    Average: "from-amber-500 to-orange-500 text-amber-500 bg-amber-500/10",
    "Needs Improvement": "from-red-500 to-rose-500 text-red-500 bg-red-500/10",
    "N/A": "from-gray-400 to-gray-500 text-gray-400 bg-gray-400/10"
  };

  const levelClass = colors[level] || colors["N/A"];
  const gradient = colors[level]?.split(" text-")[0] || colors["N/A"].split(" text-")[0];

  // SVG Radial constants
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-6 flex flex-col items-center justify-between"
    >
      <div className="w-full flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-[var(--text-h)]">Coding Consistency</h4>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${levelClass}`}>
          {level}
        </span>
      </div>

      {/* Radial Progress */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="opacity-40"
          />
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            stroke={`url(#consistency-grad)`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="consistency-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="stop-color-1" style={{ stopColor: level === "Excellent" ? "#10b981" : level === "Good" ? "#3b82f6" : level === "Average" ? "#f59e0b" : "#ef4444" }} />
              <stop offset="100%" className="stop-color-2" style={{ stopColor: level === "Excellent" ? "#06b6d4" : level === "Good" ? "#6366f1" : level === "Average" ? "#d97706" : "#e11d48" }} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-[var(--text-h)] leading-none">{score}</span>
          <span className="text-[10px] font-semibold text-[var(--text)] uppercase tracking-wider mt-1">Score</span>
        </div>
      </div>

      <div className="w-full mt-6 space-y-2 border-t border-[var(--border)] pt-4">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[var(--text)]">Current Streak</span>
          <span className="font-bold text-[var(--text-h)] flex items-center gap-1">
            🔥 {streak} days
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-[var(--text)]">Pace Impact</span>
          <span className="font-semibold text-emerald-500 flex items-center gap-1">
            <CheckIcon className="w-3.5 h-3.5" /> Stable
          </span>
        </div>
      </div>
    </motion.div>
  );
}
