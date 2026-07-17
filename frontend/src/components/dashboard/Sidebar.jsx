import { NavLink } from "react-router-dom";
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
    <aside
      className={`
        fixed
        top-0
        left-0
        z-[100]
        h-screen
        w-[85vw]
        max-w-[320px]
        bg-[var(--bg)]
        border-r
        border-[var(--border)]
        flex
        flex-col
        transform
        transition-transform
        duration-300
        ease-in-out
        lg:fixed
        lg:top-0
        lg:left-0
        lg:h-screen
        lg:w-60
        lg:z-40
        lg:translate-x-0
        lg:max-w-none
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Logo & Close Button */}
      <div className="px-5 py-5 border-b border-[var(--border)] flex items-center justify-between min-h-[73px]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <CodeBracketSquareIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-[var(--text-h)] leading-tight">
            LeetCode<br />
            <span className="text-[var(--accent)] font-extrabold">Tracker</span>
          </span>
        </div>

        {/* Mobile close button (minimum touch target 48x48px via padding) */}
        <button
          onClick={onClose}
          className="p-3 -mr-2 rounded-lg hover:bg-[var(--code-bg)] text-[var(--text)] hover:text-[var(--text-h)] transition-colors duration-200 lg:hidden flex items-center justify-center min-w-[48px] min-h-[48px]"
          title="Close Menu"
        >
          <XMarkIcon className="w-6 h-6" />
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
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group min-h-[48px] ${
                isActive
                  ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                  : "text-[var(--text)] hover:bg-[var(--code-bg)] hover:text-[var(--text-h)]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                    isActive ? "text-[var(--accent)]" : "text-[var(--text)] group-hover:text-[var(--text-h)]"
                  }`}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-[var(--border)] space-y-1">
        <button
          onClick={() => {
            onToggleTheme();
            onClose();
          }}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-[var(--text)] hover:bg-[var(--code-bg)] hover:text-[var(--text-h)] transition-all duration-200 min-h-[48px]"
        >
          <span className="text-lg leading-none">{theme === "dark" ? "☀️" : "🌙"}</span>
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200 min-h-[48px]"
        >
          <span className="text-lg leading-none">⏻</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
