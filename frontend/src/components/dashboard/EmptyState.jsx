import { motion } from "framer-motion";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function EmptyState({
  title = "No data available",
  description = "There's nothing to show here yet.",
  icon: Icon = ExclamationCircleIcon,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-[var(--accent-bg)] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[var(--accent)]" />
      </div>
      <h4 className="text-base font-semibold text-[var(--text-h)] mb-1">{title}</h4>
      <p className="text-sm text-[var(--text)] max-w-xs">{description}</p>
    </motion.div>
  );
}
