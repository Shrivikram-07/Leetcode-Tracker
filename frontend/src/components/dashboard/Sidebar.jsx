import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Squares2X2Icon,
  UserCircleIcon,
  CodeBracketSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: Squares2X2Icon },
  { label: "Profile", to: "/profile", icon: UserCircleIcon },
];

export default function Sidebar({ theme, onToggleTheme, onLogout, isOpen, onClose }) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 h-screen w-60 border-r border-[var(--border)] bg-[var(--bg)] flex flex-col z-40 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo & Close Button */}
      <div className="px-5 py-5 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <CodeBracketSquareIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-[var(--text-h)] leading-tight">
            LeetCode<br />
            <span className="text-[var(--accent)] font-extrabold">Tracker</span>
          </span>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[var(--code-bg)] text-[var(--text)] hover:text-[var(--text-h)] transition-colors duration-200 md:hidden"
          title="Close Menu"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] uppercase tracking-widest font-semibold text-[var(--text)] opacity-60">
          Menu
        </p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                  : "text-[var(--text)] hover:bg-[var(--code-bg)] hover:text-[var(--text-h)]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${
                    isActive ? "text-[var(--accent)]" : "text-[var(--text)] group-hover:text-[var(--text-h)]"
                  }`}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-[var(--border)] space-y-1">
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text)] hover:bg-[var(--code-bg)] hover:text-[var(--text-h)] transition-all duration-200"
        >
          <span className="text-base">{theme === "dark" ? "☀️" : "🌙"}</span>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200"
        >
          <span className="text-base">⏻</span>
          Log Out
        </button>
      </div>
    </motion.aside>
  );
}
