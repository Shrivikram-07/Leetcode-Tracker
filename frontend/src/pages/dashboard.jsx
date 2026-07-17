import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Hooks
import { useLeetcodeData } from "../hooks/useLeetcodeData";
import { useDashboardUser, useProblems } from "../hooks/useDashboardData";

// Layout
import DashboardLayout from "../components/dashboard/DashboardLayout";

// Section components
import StatsCard from "../components/dashboard/StatsCard";
import DifficultyPieChart from "../components/dashboard/DifficultyPieChart";
import DifficultyBarChart from "../components/dashboard/DifficultyBarChart";
import RecentActivityCard from "../components/dashboard/RecentActivityCard";
import ContestCard from "../components/dashboard/ContestCard";
import QuickActionsCard from "../components/dashboard/QuickActionsCard";
import ConnectCard from "../components/dashboard/ConnectCard";
import ChangeUsernameModal from "../components/dashboard/ChangeUsernameModal";
import ReminderModal from "../components/dashboard/ReminderModal";
import LimitModal from "../components/dashboard/LimitModal";
import { SkeletonCard, SkeletonChart } from "../components/dashboard/LoadingSkeleton";
import AddProblem from "../components/AddProblem";
import ProblemList from "../components/ProblemList";
import AIInsightsSection from "../components/dashboard/AIInsightsSection";

// Icons
import {
  CheckCircleIcon,
  SparklesIcon,
  FireIcon,
  ShieldCheckIcon,
  StarIcon,
  GlobeAltIcon,
  BoltIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import api from "../api";

// ─── Helper to format time to 12h ─────────────────────────────────────────────
function formatTime12h(timeStr) {
  if (!timeStr) return "";
  const [hoursStr, minutesStr] = timeStr.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
}

// ─── Helpers for Advanced Reminder ───────────────────────────────────────────
function getNextReminderOccurrence(reminder) {
  if (!reminder) return null;
  const now = new Date();
  const [hoursStr, minutesStr] = reminder.time.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  const matchesFrequency = (date) => {
    const day = date.getDay();
    if (reminder.frequency === "Daily") return true;
    if (reminder.frequency === "Weekdays") return day >= 1 && day <= 5;
    if (reminder.frequency === "Weekly") {
      const targetWeeklyDay = reminder.weeklyDay !== undefined ? parseInt(reminder.weeklyDay, 10) : 1;
      return day === targetWeeklyDay;
    }
    if (reminder.frequency === "Custom") {
      const targetDays = reminder.customDays || [];
      return targetDays.map(Number).includes(day);
    }
    return false;
  };

  const checkDate = new Date(now.getTime());
  checkDate.setHours(hours, minutes, 0, 0);

  if (checkDate.getTime() <= now.getTime()) {
    checkDate.setDate(checkDate.getDate() + 1);
  }

  for (let i = 0; i < 8; i++) {
    if (matchesFrequency(checkDate)) {
      return checkDate;
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }
  return null;
}

function formatUpcomingReminder(date) {
  if (!date) return "No upcoming occurrence";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Helper to build stat card definitions ────────────────────────────────────
function buildStatCards(solved, profile, contest) {
  return [
    {
      label: "Total Solved",
      value: solved?.solvedProblem ?? null,
      icon: CheckCircleIcon,
      gradient: "linear-gradient(135deg, #aa3bff, #7c3aed)",
    },
    {
      label: "Easy Solved",
      value: solved?.easySolved ?? null,
      icon: SparklesIcon,
      gradient: "linear-gradient(135deg, #10b981, #059669)",
    },
    {
      label: "Medium Solved",
      value: solved?.mediumSolved ?? null,
      icon: FireIcon,
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    },
    {
      label: "Hard Solved",
      value: solved?.hardSolved ?? null,
      icon: ShieldCheckIcon,
      gradient: "linear-gradient(135deg, #ef4444, #b91c1c)",
    },
    {
      label: "Acceptance Rate",
      value: profile?.acceptanceRate ? `${profile.acceptanceRate.toFixed(1)}%` : null,
      icon: StarIcon,
      gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    },
    {
      label: "Global Ranking",
      value: profile?.ranking ? `#${Number(profile.ranking).toLocaleString()}` : null,
      icon: GlobeAltIcon,
      gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
    },
    {
      label: "Contest Rating",
      value: contest?.contestRating ? Math.round(contest.contestRating) : null,
      icon: BoltIcon,
      gradient: "linear-gradient(135deg, #f97316, #ea580c)",
    },
    {
      label: "Current Streak",
      value: profile?.streak ?? null,
      icon: CpuChipIcon,
      gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    },
  ];
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminder, setReminder] = useState(null);
  const [editingProblem, setEditingProblem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [lastSynced, setLastSynced] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [reminderState, setReminderState] = useState(null);

  // ── Data queries ────────────────────────────────────────────────────────────
  const {
    data: lcData,
    isLoading: lcLoading,
    error: lcError,
  } = useLeetcodeData();

  const {
    data: dashboardUser,
    isLoading: userLoading,
    error: userError,
  } = useDashboardUser();

  const { data: problems = [], refetch: refetchProblems } = useProblems();

  // Load reminder settings from localStorage when userId is available
  const userId = dashboardUser?.userId;
  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`leetcode_tracker_reminder_${userId}`);
      if (stored) {
        try {
          setReminder(JSON.parse(stored));
        } catch (e) {
          console.error(e);
          setReminder(null);
        }
      } else {
        setReminder(null);
      }
    } else {
      setReminder(null);
    }
  }, [userId]);

  // Periodic reminder checking interval
  useEffect(() => {
    if (!userId || !reminder) {
      setShowReminderPopup(false);
      setReminderState(null);
      return;
    }

    const checkReminder = () => {
      const now = new Date();
      const todayStr = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0');

      const stateKey = `leetcode_tracker_reminder_state_${userId}`;
      let localState = null;
      try {
        const storedState = localStorage.getItem(stateKey);
        if (storedState) {
          localState = JSON.parse(storedState);
        }
      } catch (e) {
        console.error(e);
      }

      if (!localState || localState.date !== todayStr) {
        localState = {
          date: todayStr,
          status: "pending",
          snoozedUntil: null
        };
        localStorage.setItem(stateKey, JSON.stringify(localState));
      }

      setReminderState(localState);

      // Check frequency match
      const day = now.getDay();
      let frequencyMatches = false;
      if (reminder.frequency === "Daily") {
        frequencyMatches = true;
      } else if (reminder.frequency === "Weekdays") {
        frequencyMatches = day >= 1 && day <= 5;
      } else if (reminder.frequency === "Weekly") {
        const targetWeeklyDay = reminder.weeklyDay !== undefined ? parseInt(reminder.weeklyDay, 10) : 1;
        frequencyMatches = day === targetWeeklyDay;
      } else if (reminder.frequency === "Custom") {
        const targetDays = reminder.customDays || [];
        frequencyMatches = targetDays.map(Number).includes(day);
      }

      if (!frequencyMatches) return;

      // Check if current time is past reminder time
      const [hoursStr, minutesStr] = reminder.time.split(":");
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      const targetTime = new Date(now.getTime());
      targetTime.setHours(hours, minutes, 0, 0);

      if (now.getTime() >= targetTime.getTime()) {
        if (localState.status === "pending") {
          setShowReminderPopup(true);
        } else if (localState.status === "snoozed" && localState.snoozedUntil) {
          if (now.getTime() >= localState.snoozedUntil) {
            setShowReminderPopup(true);
          }
        }
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 5000);
    return () => clearInterval(interval);
  }, [userId, reminder]);

  const handleDismissReminder = () => {
    setShowReminderPopup(false);
    if (!userId) return;
    const stateKey = `leetcode_tracker_reminder_state_${userId}`;
    const newState = {
      ...reminderState,
      status: "dismissed",
      snoozedUntil: null
    };
    localStorage.setItem(stateKey, JSON.stringify(newState));
    setReminderState(newState);
    toast.success("Reminder dismissed.");
  };

  const handleCompleteReminder = () => {
    setShowReminderPopup(false);
    if (!userId) return;
    const stateKey = `leetcode_tracker_reminder_state_${userId}`;
    const newState = {
      ...reminderState,
      status: "completed",
      snoozedUntil: null
    };
    localStorage.setItem(stateKey, JSON.stringify(newState));
    setReminderState(newState);
    toast.success("Awesome! LeetCode task marked completed today!", {
      icon: "🎉",
    });
  };

  const handleSnoozeReminder = () => {
    setShowReminderPopup(false);
    if (!userId) return;
    const stateKey = `leetcode_tracker_reminder_state_${userId}`;
    const snoozeTime = Date.now() + 30 * 60 * 1000;
    const newState = {
      ...reminderState,
      status: "snoozed",
      snoozedUntil: snoozeTime
    };
    localStorage.setItem(stateKey, JSON.stringify(newState));
    setReminderState(newState);
    toast.success("Snoozed for 30 minutes.");
  };

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/");
  }, [navigate]);

  // Auth error redirect
  useEffect(() => {
    if (userError?.response?.status === 401 || userError?.response?.status === 403) {
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [userError, navigate]);

  // Update last synced when data arrives
  useEffect(() => {
    if (lcData) setLastSynced(new Date().toISOString());
  }, [lcData]);

  // ── Derived data ────────────────────────────────────────────────────────────
  const isConnected = !!lcData;
  const notConnected = !lcLoading && (lcError?.response?.status === 404 || !lcData);

  const { solved, profile, contest, history, submissions } = lcData ?? {};
  const statCards = buildStatCards(solved, profile, contest);

  // Username extraction: the API returns the username inside profile
  const leetcodeUsername = profile?.username ?? profile?.userAvatar?.split("/").pop() ?? null;
  const appUsername = dashboardUser?.message?.replace("Welcome ", "") ?? "";

  // ── Problem filtering ───────────────────────────────────────────────────────
  const uniqueTopics = [...new Set(problems.map((p) => p.topic).filter(Boolean))].sort();

  const filteredProblems = problems.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (p.title?.toLowerCase().includes(q) || p.topic?.toLowerCase().includes(q));
    return (
      matchSearch &&
      (!filterDifficulty || p.difficulty === filterDifficulty) &&
      (!filterStatus || p.status === filterStatus) &&
      (!filterTopic || p.topic === filterTopic)
    );
  });

  // ── Action handlers ─────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const toastId = toast.loading("Refreshing stats…");
    try {
      // Force cache refresh in backend for both endpoints (Task 6)
      await api.get("/leetcode/profile?refresh=true");
      await api.get("/analytics?refresh=true");

      await queryClient.invalidateQueries({ queryKey: ["leetcodeProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["analytics"] });
      setLastSynced(new Date().toISOString());
      toast.success("Stats refreshed!", { id: toastId });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to refresh stats.";
      toast.error(msg, { id: toastId });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteProblem = async (id) => {
    if (!window.confirm("Delete this problem?")) return;
    try {
      await api.delete(`/problems/${id}`);
      refetchProblems();
    } catch {
      toast.error("Failed to delete problem.");
    }
  };

  // ── Local tracker stats ────────────────────────────────────────────────────
  const totalProblems = problems.length;
  const solvedLocal = problems.filter((p) => p.status === "Solved").length;
  const attempting = problems.filter((p) => p.status === "Attempting").length;
  const todo = problems.filter((p) => p.status === "To Do").length;
  const easyLocal = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumLocal = problems.filter((p) => p.difficulty === "Medium").length;
  const hardLocal = problems.filter((p) => p.difficulty === "Hard").length;

  const localSolved = { easySolved: easyLocal, mediumSolved: mediumLocal, hardSolved: hardLocal };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      username={appUsername}
      leetcodeUsername={leetcodeUsername}
      lastSynced={lastSynced}
      isRefreshing={isRefreshing}
      onOpenReminder={() => setReminderModalOpen(true)}
    >
      {/* ── Change Username Modal ─────────────────────────────────────────── */}
      <ChangeUsernameModal
        isOpen={changeModalOpen}
        onClose={() => setChangeModalOpen(false)}
      />

      {/* ── Reminder Modal ────────────────────────────────────────────────── */}
      <ReminderModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        onSave={(settings) => setReminder(settings)}
        userId={userId}
      />

      {/* ── Not Connected → show Connect Card ─────────────────────────────── */}
      {notConnected && <ConnectCard />}

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {lcLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </div>
      )}

      {/* ── Connected → full dashboard ────────────────────────────────────── */}
      {isConnected && (
        <div className="space-y-6">

          {/* ── Welcome Banner ──────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-violet-500/30 flex-shrink-0">
              {appUsername.slice(0, 1).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--text)] font-medium uppercase tracking-widest mb-0.5">
                Welcome back
              </p>
              <h2 className="text-lg font-bold text-[var(--text-h)] truncate">
                {appUsername || "Coder"}
              </h2>
              {leetcodeUsername && (
                <p className="text-xs text-[var(--text)] mt-0.5">
                  Connected as{" "}
                  <span className="font-semibold text-[var(--accent)]">
                    @{leetcodeUsername}
                  </span>
                </p>
              )}
            </div>
            {/* Quick Actions in banner */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto mt-3 sm:mt-0">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--code-bg)] border border-[var(--border)] text-[var(--text-h)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-200 disabled:opacity-60 flex-1 sm:flex-initial"
              >
                {isRefreshing ? "Refreshing…" : "⟳ Refresh"}
              </button>
              <button
                onClick={() => setChangeModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--code-bg)] border border-[var(--border)] text-[var(--text-h)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-200 flex-1 sm:flex-initial"
              >
                ✎ Change Username
              </button>
            </div>
          </div>

          {/* ── Reminder Banner/Card ────────────────────────────────────────── */}
          {reminder ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-5 space-y-4 text-left animate-slide-up">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-base shadow-md shadow-violet-500/20">
                    🔔
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-h)]">
                    {reminder.title || "LeetCode Reminder"}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    reminderState?.status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                    reminderState?.status === "snoozed" ? "bg-amber-500/10 text-amber-500" :
                    reminderState?.status === "dismissed" ? "bg-red-500/10 text-red-500" :
                    "bg-blue-500/10 text-blue-500 animate-pulse"
                  }`}>
                    {reminderState?.status === "completed" ? "Completed Today" :
                     reminderState?.status === "snoozed" ? `Snoozed until ${new Date(reminderState.snoozedUntil).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}` :
                     reminderState?.status === "dismissed" ? "Dismissed" :
                     "Pending Today"}
                  </span>
                  
                  {reminderState?.status !== "completed" && (
                    <button
                      onClick={handleCompleteReminder}
                      className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors duration-200"
                    >
                      ✓ Complete
                    </button>
                  )}

                  <button
                    onClick={() => setReminderModalOpen(true)}
                    className="px-3 py-1 rounded-lg border border-[var(--border)] text-[var(--text-h)] text-xs font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-200 bg-[var(--bg)]"
                  >
                    Edit
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-0.5">Subject</p>
                  <p className="text-xs font-semibold text-[var(--text-h)] truncate">{reminder.subject || "Time to solve today's LeetCode problems!"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-0.5">Description</p>
                  <p className="text-xs text-[var(--text)] truncate">{reminder.description || "Keep the streak alive and stay interview ready."}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-0.5">Time & Frequency</p>
                  <p className="text-xs font-semibold text-[var(--text-h)]">
                    {formatTime12h(reminder.time)} • {reminder.frequency}
                    {reminder.frequency === "Custom" && ` (${(reminder.customDays || []).map(d => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ")})`}
                    {reminder.frequency === "Weekly" && ` (every ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][reminder.weeklyDay]})`}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-0.5">Upcoming reminder</p>
                  <p className="text-xs font-semibold text-[var(--text-h)]">
                    {formatUpcomingReminder(getNextReminderOccurrence(reminder))}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-lg flex-shrink-0">
                  🔔
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text)]">LeetCode Reminder</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-extrabold text-[var(--text-h)] flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
                      ⚪ No Reminder Configured
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text)] mt-1 leading-normal">
                    Set a custom daily, weekly, or weekday reminder to practice LeetCode problems.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReminderModalOpen(true)}
                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-200 shadow-sm active:scale-[0.98] w-full sm:w-auto flex-shrink-0"
              >
                Set Reminder
              </button>
            </div>
          )}

          {/* ── Tabs Navigation ──────────────────────────────────────────────── */}
          <div className="flex border-b border-[var(--border)] gap-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
                activeTab === "overview"
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--text)] hover:text-[var(--text-h)]"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("ai-insights")}
              className={`pb-3 text-sm font-semibold transition-all duration-200 border-b-2 flex items-center gap-1.5 ${
                activeTab === "ai-insights"
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--text)] hover:text-[var(--text-h)]"
              }`}
            >
              <CpuChipIcon className="w-4 h-4" />
              AI Insights
            </button>
          </div>

          {activeTab === "overview" ? (
            <>
              {/* ── Stats Cards Grid ─────────────────────────────────────────────── */}
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text)] mb-3 opacity-70">
                  LeetCode Stats
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statCards.map((card, i) => (
                    <StatsCard key={card.label} {...card} delay={i * 0.04} />
                  ))}
                </div>
              </section>

              {/* ── Charts Row ───────────────────────────────────────────────────── */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DifficultyPieChart solved={solved} delay={0.1} />
                <DifficultyBarChart solved={solved} delay={0.15} />
              </section>

              {/* ── Activity + Contest Row ───────────────────────────────────────── */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <RecentActivityCard submissions={submissions} delay={0.2} />
                </div>
                <ContestCard contest={contest} delay={0.25} />
              </section>

              {/* ── Quick Actions ─────────────────────────────────────────────────── */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickActionsCard
                  onRefresh={handleRefresh}
                  onChangeUsername={() => setChangeModalOpen(true)}
                  leetcodeUsername={leetcodeUsername}
                  isRefreshing={isRefreshing}
                  delay={0.3}
                />

                {/* Local tracker summary card */}
                <div className="md:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-5">
                  <h3 className="text-sm font-semibold text-[var(--text-h)] mb-4">
                    Local Tracker Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { label: "Tracked", value: totalProblems, color: "text-[var(--accent)]" },
                      { label: "Solved", value: solvedLocal, color: "text-emerald-500" },
                      { label: "Attempting", value: attempting, color: "text-amber-500" },
                      { label: "To Do", value: todo, color: "text-[var(--text)]" },
                      { label: "Solve %", value: totalProblems > 0 ? `${Math.round((solvedLocal / totalProblems) * 100)}%` : "0%", color: "text-blue-500" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-center">
                        <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] uppercase tracking-widest text-[var(--text)] mt-0.5 font-semibold">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── Local Pie & Bar for Local Tracker ─────────────────────────────── */}
              {totalProblems > 0 && (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DifficultyPieChart solved={localSolved} delay={0.35} />
                  <DifficultyBarChart solved={localSolved} delay={0.4} />
                </section>
              )}
            </>
          ) : (
            <AIInsightsSection solved={solved} streak={profile?.streak || 0} />
          )}
        </div>
      )}

      {/* ── Problem Tracker (always shown when logged in) ──────────────────── */}
      {!lcLoading && (
        <div className="mt-6 space-y-4 animate-slide-up">
          {/* Add Problem */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-5">
            <AddProblem
              onProblemAdded={refetchProblems}
              editingProblem={editingProblem}
              setEditingProblem={setEditingProblem}
              problemCount={problems.length}
              onShowLimitModal={() => setShowLimitModal(true)}
            />
          </div>

          {/* Problem List */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-h)]">
                Your Tracked Problems
                {totalProblems > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[var(--accent-bg)] text-[var(--accent)] font-semibold">
                    {totalProblems}
                  </span>
                )}
              </h3>
              <input
                type="text"
                placeholder="Search title or topic…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-sm placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-all duration-200 w-full max-w-xs"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                {
                  value: filterDifficulty,
                  onChange: setFilterDifficulty,
                  options: [["", "All Difficulties"], ["Easy", "Easy"], ["Medium", "Medium"], ["Hard", "Hard"]],
                },
                {
                  value: filterStatus,
                  onChange: setFilterStatus,
                  options: [["", "All Statuses"], ["To Do", "To Do"], ["Attempting", "Attempting"], ["Solved", "Solved"]],
                },
                {
                  value: filterTopic,
                  onChange: setFilterTopic,
                  options: [["", "All Topics"], ...uniqueTopics.map((t) => [t, t])],
                },
              ].map((f, i) => (
                <select
                  key={i}
                  value={f.value}
                  onChange={(e) => f.onChange(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-sm focus:outline-none focus:border-[var(--accent)] transition-all duration-200 cursor-pointer"
                >
                  {f.options.map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              ))}
              {(filterDifficulty || filterStatus || filterTopic || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterDifficulty("");
                    setFilterStatus("");
                    setFilterTopic("");
                    setSearchQuery("");
                  }}
                  className="px-3 py-2 rounded-xl border border-red-300 text-red-500 text-sm hover:bg-red-500/10 transition-all duration-200"
                >
                  ✕ Reset
                </button>
              )}
            </div>

            <ProblemList
              problems={filteredProblems}
              onDelete={handleDeleteProblem}
              onEdit={setEditingProblem}
            />
          </div>
        </div>
      )}

      {/* ── Limit Modal (Premium check) ─────────────────────────────────── */}
      <LimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />

      {/* ── Reminder Popup Alert ────────────────────────────────────────── */}
      <AnimatePresence>
        {showReminderPopup && reminder && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] pointer-events-auto"
            />
            {/* Popup */}
            <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="pointer-events-auto w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl p-6 flex flex-col text-center"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-violet-500/20 mb-4 animate-bounce">
                  🔔
                </div>
                <h3 className="text-xl font-extrabold text-[var(--text-h)] mb-1">
                  {reminder.title || "LeetCode Reminder"}
                </h3>
                <p className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
                  {reminder.subject || "Time to solve today's LeetCode problems!"}
                </p>
                <p className="text-sm text-[var(--text)] leading-relaxed mb-6">
                  {reminder.description || "Keep the streak alive and stay interview ready."}
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleCompleteReminder}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-base hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-200 active:scale-[0.98]"
                  >
                    Mark Completed
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSnoozeReminder}
                      className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text-h)] hover:bg-[var(--code-bg)] transition-all duration-200"
                    >
                      Snooze 30 Min
                    </button>
                    <button
                      onClick={handleDismissReminder}
                      className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all duration-200"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}