import { motion } from "framer-motion";
import {
  ArrowPathIcon,
  UserCircleIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

export default function QuickActionsCard({
  onRefresh,
  onChangeUsername,
  leetcodeUsername,
  isRefreshing,
  delay = 0,
}) {
  const actions = [
    {
      label: isRefreshing ? "Refreshing…" : "Refresh Stats",
      icon: ArrowPathIcon,
      onClick: onRefresh,
      disabled: isRefreshing,
      gradient: "from-violet-500 to-purple-600",
      spin: isRefreshing,
    },
    {
      label: "Change Username",
      icon: UserCircleIcon,
      onClick: onChangeUsername,
      disabled: false,
      gradient: "from-blue-500 to-cyan-500",
      spin: false,
    },
    {
      label: "View on LeetCode",
      icon: ArrowTopRightOnSquareIcon,
      onClick: () =>
        window.open(
          `https://leetcode.com/${leetcodeUsername}/`,
          "_blank",
          "noopener"
        ),
      disabled: !leetcodeUsername,
      gradient: "from-amber-500 to-orange-500",
      spin: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-5"
    >
      <h3 className="text-sm font-semibold text-[var(--text-h)] mb-4">
        Quick Actions
      </h3>

      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: action.disabled ? 1 : 1.02 }}
            whileTap={{ scale: action.disabled ? 1 : 0.98 }}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 bg-gradient-to-r ${action.gradient} ${
              action.disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg hover:shadow-black/10"
            }`}
          >
            <action.icon
              className={`w-4 h-4 flex-shrink-0 ${action.spin ? "animate-spin" : ""}`}
            />
            {action.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
