import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import EmptyState from "./EmptyState";
import { ChartPieIcon } from "@heroicons/react/24/outline";

const COLORS = {
  Easy: "#10b981",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-lg px-3 py-2 text-sm">
        <span className="font-semibold text-[var(--text-h)]">{name}:</span>{" "}
        <span className="text-[var(--text)]">{value}</span>
      </div>
    );
  }
  return null;
};

export default function DifficultyPieChart({ solved, delay = 0 }) {
  const data = [
    { name: "Easy", value: solved?.easySolved ?? 0 },
    { name: "Medium", value: solved?.mediumSolved ?? 0 },
    { name: "Hard", value: solved?.hardSolved ?? 0 },
  ].filter((d) => d.value > 0);

  const isEmpty = data.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-5"
    >
      <h3 className="text-sm font-semibold text-[var(--text-h)] mb-4 flex items-center gap-2">
        <ChartPieIcon className="w-4 h-4 text-[var(--accent)]" />
        Difficulty Breakdown
      </h3>

      {isEmpty ? (
        <EmptyState
          title="No solved problems yet"
          description="Solve some problems to see your difficulty breakdown."
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(val) => (
                <span style={{ color: "var(--text)", fontSize: 12 }}>{val}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
