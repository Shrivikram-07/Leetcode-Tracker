import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

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

  return (
    <div className="flex min-h-screen bg-[var(--bg)] w-full">
      {/* Mobile Backdrop blur overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
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
      <div className="flex flex-col flex-1 min-w-0 md:ml-60">
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
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
