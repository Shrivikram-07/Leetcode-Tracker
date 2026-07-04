import { motion } from "framer-motion";
import { AcademicCapIcon, BriefcaseIcon } from "@heroicons/react/24/outline";

export default function InterviewReadinessCard({ readiness, solved }) {
  const { score = 0, level = "N/A" } = readiness || {};

  const colors = {
    "FAANG Ready": "from-purple-500 to-indigo-500 text-purple-500 bg-purple-500/10",
    "Interview Ready": "from-emerald-500 to-teal-500 text-emerald-500 bg-emerald-500/10",
    Intermediate: "from-blue-500 to-cyan-500 text-blue-500 bg-blue-500/10",
    Beginner: "from-amber-500 to-orange-500 text-amber-500 bg-amber-500/10",
    "N/A": "from-gray-400 to-gray-500 text-gray-400 bg-gray-400/10"
  };

  const levelClass = colors[level] || colors["N/A"];

  // SVG Radial constants
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-6 flex flex-col items-center justify-between"
    >
      <div className="w-full flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-[var(--text-h)]">Interview Readiness</h4>
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
            stroke={`url(#readiness-grad)`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="readiness-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: level === "FAANG Ready" ? "#a855f7" : level === "Interview Ready" ? "#10b981" : level === "Intermediate" ? "#3b82f6" : "#f59e0b" }} />
              <stop offset="100%" style={{ stopColor: level === "FAANG Ready" ? "#6366f1" : level === "Interview Ready" ? "#06b6d4" : level === "Intermediate" ? "#06b6d4" : "#d97706" }} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-[var(--text-h)] leading-none">{score}</span>
          <span className="text-[10px] font-semibold text-[var(--text)] uppercase tracking-wider mt-1">Ready %</span>
        </div>
      </div>

      <div className="w-full mt-6 space-y-2 border-t border-[var(--border)] pt-4">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[var(--text)]">Mediums Solved</span>
          <span className="font-bold text-[var(--text-h)]">
            {solved?.mediumSolved || 0}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-[var(--text)]">Hards Solved</span>
          <span className="font-bold text-[var(--text-h)]">
            {solved?.hardSolved || 0}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
