import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import EmptyState from "./EmptyState";
import { ChartBarIcon } from "@heroicons/react/24/outline";

const COLORS = {
  Easy: "#10b981",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-lg px-3 py-2 text-sm">
        <span className="font-semibold text-[var(--text-h)]">{label}:</span>{" "}
        <span className="text-[var(--text)]">{payload[0].value} problems</span>
      </div>
    );
  }
  return null;
};

export default function DifficultyBarChart({ solved, delay = 0 }) {
  const data = [
    { name: "Easy", count: solved?.easySolved ?? 0 },
    { name: "Medium", count: solved?.mediumSolved ?? 0 },
    { name: "Hard", count: solved?.hardSolved ?? 0 },
  ];

  const isEmpty = data.every((d) => d.count === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-5"
    >
      <h3 className="text-sm font-semibold text-[var(--text-h)] mb-4 flex items-center gap-2">
        <ChartBarIcon className="w-4 h-4 text-[var(--accent)]" />
        Difficulty Comparison
      </h3>

      {isEmpty ? (
        <EmptyState
          title="No data to compare"
          description="Solve problems to see your difficulty comparison chart."
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="var(--text)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--text)"
              fontSize={12}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={64}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
