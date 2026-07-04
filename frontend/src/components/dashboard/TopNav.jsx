import { motion } from "framer-motion";
import { ArrowPathIcon, BellIcon, Bars3Icon } from "@heroicons/react/24/outline";

export default function TopNav({
  username,
  leetcodeUsername,
  lastSynced,
  isRefreshing,
  onMenuToggle,
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
      className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md"
    >
      {/* Left — Hamburger & Page title + breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg hover:bg-[var(--code-bg)] text-[var(--text)] hover:text-[var(--text-h)] transition-colors duration-200 md:hidden"
          title="Open Menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        <div>
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
      </div>

      {/* Right — Avatar */}
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text)] hover:bg-[var(--code-bg)] transition-colors duration-200">
          <BellIcon className="w-4 h-4" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-violet-500/30 flex-shrink-0">
          {initials}
        </div>
      </div>
    </motion.header>
  );
}
