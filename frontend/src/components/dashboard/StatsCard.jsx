import { motion } from "framer-motion";

export default function StatsCard({
  label,
  value,
  icon: Icon,
  gradient,
  delay = 0,
  badge,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-5 cursor-default group"
    >
      {/* Gradient accent glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ background: gradient, opacity: 0.06 }}
      />

      <div className="relative flex items-start justify-between gap-3">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: gradient }}
        >
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>

        {/* Badge */}
        {badge !== undefined && (
          <span className="text-xs font-semibold text-[var(--text)] bg-[var(--border)] px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>

      <div className="relative mt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text)] mb-1">
          {label}
        </p>
        <p className="text-3xl font-extrabold text-[var(--text-h)] leading-none">
          {value ?? (
            <span className="text-lg font-medium text-[var(--text)]">—</span>
          )}
        </p>
      </div>
    </motion.div>
  );
}
