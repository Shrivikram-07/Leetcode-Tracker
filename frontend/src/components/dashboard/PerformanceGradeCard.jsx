import { motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/outline";

export default function PerformanceGradeCard({ grade, habits }) {
  // Mapping grades to custom style and labels
  const grades = {
    "A+": { color: "from-purple-500 to-indigo-500", text: "text-purple-500", bg: "bg-purple-500/10", shadow: "shadow-purple-500/20", desc: "Outstanding profile with high diversity and strong consistent solved counts." },
    A: { color: "from-emerald-500 to-teal-500", text: "text-emerald-500", bg: "bg-emerald-500/10", shadow: "shadow-emerald-500/20", desc: "Excellent progress. Consistent solver with strong foundational topic diversity." },
    "B+": { color: "from-blue-500 to-cyan-500", text: "text-blue-500", bg: "bg-blue-500/10", shadow: "shadow-blue-500/20", desc: "Above average stats. Keep working on hard-level topics and contest participation." },
    B: { color: "from-amber-500 to-orange-500", text: "text-amber-500", bg: "bg-amber-500/10", shadow: "shadow-amber-500/20", desc: "Solid base. Focus on increasing your consistency and tackle medium-difficulty questions." },
    C: { color: "from-red-500 to-rose-500", text: "text-red-500", bg: "bg-red-500/10", shadow: "shadow-red-500/20", desc: "Needs growth. Build a daily habit and expand into dynamic programming or graph topics." }
  };

  const currentGrade = grades[grade] || grades["C"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-6 flex flex-col items-center justify-between relative overflow-hidden"
    >
      <div className="w-full flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-[var(--text-h)]">Overall Grade</h4>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--border)] text-[var(--text-h)]">
          LeetCode Rank Tier
        </span>
      </div>

      <div className="relative my-4 flex items-center justify-center">
        {/* Glow */}
        <div className={`absolute w-24 h-24 rounded-full filter blur-xl opacity-25 bg-gradient-to-r ${currentGrade.color}`} />
        
        {/* Big Grade Symbol */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${currentGrade.color} flex items-center justify-center text-white text-5xl font-black shadow-lg ${currentGrade.shadow}`}
        >
          {grade}
        </motion.div>
      </div>

      <div className="w-full mt-6 text-center">
        <p className="text-xs text-[var(--text)] font-semibold uppercase tracking-wider mb-1">
          Practice Habit: <span className="text-[var(--text-h)] font-bold">{habits}</span>
        </p>
        <p className="text-xs text-[var(--text)] leading-relaxed">
          {currentGrade.desc}
        </p>
      </div>
    </motion.div>
  );
}
