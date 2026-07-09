import { motion } from "framer-motion";
import { ArrowPathIcon, BellIcon, Bars3Icon, CodeBracketSquareIcon } from "@heroicons/react/24/outline";

export default function TopNav({
  username,
  leetcodeUsername,
  lastSynced,
  isRefreshing,
  onMenuToggle,
  onOpenReminder,
}) {
  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : "??";

  const syncedText = lastSynced
    ? `Synced ${new Date(lastSynced).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Not yet synced";

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md min-h-[73px]"
    >
      {/* Mobile view (<1024px): Hamburger & Logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onMenuToggle}
          className="p-3 -ml-3 rounded-lg hover:bg-[var(--code-bg)] text-[var(--text)] hover:text-[var(--text-h)] transition-colors duration-200 min-w-[48px] min-h-[48px] flex items-center justify-center"
          title="Open Menu"
          aria-label="Open Menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <CodeBracketSquareIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-bold text-[var(--text-h)] leading-tight">
            LeetCode<br />
            <span className="text-[var(--accent)] font-extrabold">Tracker</span>
          </span>
        </div>
      </div>

      {/* Desktop/Tablet view (>=1024px): Page Title & Subtitle */}
      <div className="hidden lg:block">
        <h1 className="text-base sm:text-lg font-bold text-[var(--text-h)] leading-none mb-0.5">
          Analytics Dashboard
        </h1>
        <p className="text-[10px] sm:text-xs text-[var(--text)] flex items-center gap-1.5">
          {leetcodeUsername && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span className="font-medium text-[var(--text-h)]">
                @{leetcodeUsername}
              </span>
              <span>·</span>
            </>
          )}
          {syncedText}
          {isRefreshing && (
            <ArrowPathIcon className="w-3 h-3 text-[var(--accent)] animate-spin ml-1" />
          )}
        </p>
      </div>

      {/* Right side: Bell & Avatar (on all widths) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenReminder}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-[var(--text)] hover:bg-[var(--code-bg)] hover:text-[var(--accent)] transition-colors duration-200 min-w-[48px] min-h-[48px]"
          title="Reminder Settings"
          aria-label="Open Reminder Settings"
        >
          <BellIcon className="w-6 h-6 md:w-5 md:h-5" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-violet-500/30 flex-shrink-0">
          {initials}
        </div>
      </div>
    </motion.header>
  );
}
