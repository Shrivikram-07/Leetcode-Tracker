import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function DashboardLayout({
  username,
  leetcodeUsername,
  lastSynced,
  isRefreshing,
  onOpenReminder,
  children,
}) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "light"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const syncedText = lastSynced
    ? `Synced ${new Date(lastSynced).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Not yet synced";

  return (
    <div className="flex min-h-screen bg-[var(--bg)] w-full overflow-x-hidden">
      {/* Mobile Backdrop overlay (dark transparent backdrop) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Responsive togglable) */}
      <Sidebar
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 md:ml-20 lg:ml-60 transition-all duration-300">
        {/* Top Nav (Responsive hamburger trigger passed) */}
        <TopNav
          username={username}
          leetcodeUsername={leetcodeUsername}
          lastSynced={lastSynced}
          isRefreshing={isRefreshing}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenReminder={onOpenReminder}
        />

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {/* Mobile title banner */}
          <div className="mb-6 md:hidden animate-fade-in">
            <h1 className="text-xl font-bold text-[var(--text-h)] leading-none mb-1.5">
              Analytics Dashboard
            </h1>
            <p className="text-xs text-[var(--text)] flex items-center gap-1.5">
              {leetcodeUsername && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="font-semibold text-[var(--text-h)]">
                    @{leetcodeUsername}
                  </span>
                  <span>·</span>
                </>
              )}
              {syncedText}
              {isRefreshing && (
                <ArrowPathIcon className="w-3 h-3 text-[var(--accent)] animate-spin ml-1 inline-block" />
              )}
            </p>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
