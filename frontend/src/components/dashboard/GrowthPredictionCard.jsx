import { motion } from "framer-motion";
import { BoltIcon, ChartBarIcon } from "@heroicons/react/24/outline";

export default function GrowthPredictionCard({ growth }) {
  const { dailyPace = 0.5, timeTo100 = "", timeTo250 = "", timeTo500 = "", timeTo1000 = "" } = growth || {};

  const targets = [
    { target: "100 Problems", time: timeTo100, color: "from-blue-500 to-indigo-500", desc: "Foundational mastery" },
    { target: "250 Problems", time: timeTo250, color: "from-cyan-500 to-blue-500", desc: "Core interview readiness" },
    { target: "500 Problems", time: timeTo500, color: "from-purple-500 to-pink-500", desc: "FAANG preparation level" },
    { target: "1000 Problems", time: timeTo1000, color: "from-amber-500 to-orange-500", desc: "Expert competitive level" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-6"
    >
      <div className="w-full flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-[var(--text-h)]">Growth & Solved Target Predictions</h4>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--border)] text-[var(--text-h)] flex items-center gap-1">
          <BoltIcon className="w-3 h-3 text-amber-500 animate-pulse" />
          Pace: {dailyPace}/day
        </span>
      </div>

      <p className="text-xs text-[var(--text)] mb-6 leading-relaxed">
        Estimated target completion dates computed using your average accepted submissions pace over the last 20 active solves.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {targets.map((item, idx) => (
          <motion.div
            key={item.target}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + idx * 0.05 }}
            className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex flex-col justify-between"
          >
            <div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white bg-gradient-to-r ${item.color}`}>
                Target {idx + 1}
              </span>
              <h5 className="text-sm font-bold text-[var(--text-h)] mt-3">{item.target}</h5>
              <p className="text-[10px] text-[var(--text)] mt-0.5 leading-tight">{item.desc}</p>
            </div>
            
            <div className="border-t border-[var(--border)] mt-4 pt-3">
              <span className="text-[10px] font-semibold text-[var(--text)] uppercase tracking-wider block">Estimated Duration</span>
              <span className="text-sm font-black text-[var(--text-h)] mt-1 block">{item.time || "Coming Soon"}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
