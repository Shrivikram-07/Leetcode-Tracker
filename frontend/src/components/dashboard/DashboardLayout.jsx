import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "light"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("leetcode_tracker_reminder");
    queryClient.clear();
    setSidebarOpen(false);
    navigate("/");
  };

  // Prevent body scrolling while open on mobile only
  useEffect(() => {
    const handleBodyScroll = () => {
      if (sidebarOpen && window.innerWidth < 1024) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };

    handleBodyScroll();
    window.addEventListener("resize", handleBodyScroll);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", handleBodyScroll);
    };
  }, [sidebarOpen]);

  // Pressing Escape should close it
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarOpen]);

  const syncedText = lastSynced
    ? `Synced ${new Date(lastSynced).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Not yet synced";

  return (
    <div className="flex min-h-screen bg-[var(--bg)] w-full overflow-x-hidden">
      {/* Backdrop overlay (z-[90] is above TopNav and below Sidebar) */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 lg:hidden z-[90] ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar (Responsive togglable) */}
      <Sidebar
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-60 transition-all duration-300">
        {/* Top Nav (Responsive hamburger trigger passed) */}
        <TopNav
          username={username}
          leetcodeUsername={leetcodeUsername}
          lastSynced={lastSynced}
          isRefreshing={isRefreshing}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          onOpenReminder={onOpenReminder}
        />

        {/* Page content */}
        <main className="flex-1 py-4 md:py-6 lg:py-8 overflow-y-auto">
          {/* Mobile title banner */}
          <div className="mb-6 lg:hidden animate-fade-in px-4 md:px-6">
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

          <div className="mx-auto max-w-[1400px] w-full px-4 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
