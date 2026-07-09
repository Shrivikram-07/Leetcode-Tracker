import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import ReminderModal from "../components/dashboard/ReminderModal";

function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [profileData, setProfileData] = useState(null);
  
  // Leetcode specific states
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [connectUsername, setConnectUsername] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "light"
  );
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchProfile = async () => {
    try {
      const profileRes = await api.get("/users/profile");
      setProfileData(profileRes.data.user);
      
      // If user has connected leetcode, fetch leetcode data
      if (profileRes.data.user.leetcode_username) {
        await fetchLeetcodeData();
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLeetcodeData = async (forceRefresh = false) => {
    try {
      const url = forceRefresh ? "/leetcode/profile?refresh=true" : "/leetcode/profile";
      const res = await api.get(url);
      setLeetcodeData(res.data.data);
    } catch (err) {
      console.error("Fetch leetcode data error:", err);
      throw err;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchProfile();
  }, [navigate]);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!connectUsername.trim()) return;

    setIsConnecting(true);
    try {
      await api.post("/leetcode/connect", { leetcode_username: connectUsername });
      alert("LeetCode account connected successfully!");
      queryClient.invalidateQueries();
      setLoading(true);
      await fetchProfile(); // re-fetch everything
    } catch (err) {
      alert(err.response?.data?.message || "Failed to connect LeetCode account");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetchLeetcodeData(true);
      alert("LeetCode profile synced successfully!");
      queryClient.invalidateQueries();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to sync with LeetCode.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const res = await api.post("/leetcode/import");
      alert(res.data.message || "Import completed successfully!");
      queryClient.invalidateQueries();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to import problems");
    } finally {
      setIsImporting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  
  // Prepare contest history data for chart
  const contestHistoryData = leetcodeData?.history?.contestHistory?.map(contest => ({
      name: contest.contest?.title,
      rating: Math.round(contest.rating),
      date: new Date(contest.contest?.startTime * 1000).toLocaleDateString()
  })) || [];

  return (
    <DashboardLayout
      username={profileData?.username || ""}
      leetcodeUsername={profileData?.leetcode_username || ""}
      lastSynced={leetcodeData ? new Date().toISOString() : null}
      isRefreshing={isSyncing}
      onOpenReminder={() => setReminderModalOpen(true)}
    >
      <ReminderModal isOpen={reminderModalOpen} onClose={() => setReminderModalOpen(false)} userId={profileData?.id} />
      {loading ? (
        <p className="text-sm text-[var(--text)]">Loading Profile...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Native Profile Card */}
          <div className="glass-panel p-6 sm:p-8 text-left animate-slide-up hover-lift">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-h)] pb-3 mb-5 border-b border-[var(--glass-border)] gradient-text">
              Tracker Profile
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center py-2.5 border-b border-dashed border-[var(--border)]">
                <span className="text-sm font-semibold text-[var(--text)]">Username</span>
                <span className="text-sm sm:text-base font-bold text-[var(--text-h)]">{profileData?.username || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-dashed border-[var(--border)]">
                <span className="text-sm font-semibold text-[var(--text)]">Email</span>
                <span className="text-sm sm:text-base font-bold text-[var(--text-h)] truncate max-w-[180px] sm:max-w-none">{profileData?.email || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-dashed border-[var(--border)]">
                <span className="text-sm font-semibold text-[var(--text)]">Member Since</span>
                <span className="text-sm sm:text-base font-bold text-[var(--text-h)]">{formatDate(profileData?.created_at)}</span>
              </div>
            </div>
          </div>

          {/* LeetCode Section */}
          {!profileData?.leetcode_username ? (
            <div className="glass-panel p-6 sm:p-8 text-left animate-slide-up hover-lift" style={{ animationDelay: "0.1s" }}>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-h)] pb-3 mb-5 border-b border-[var(--glass-border)]">
                Connect LeetCode
              </h3>
              <p className="text-sm text-[var(--text)] mb-4 leading-relaxed">
                Link your public LeetCode username to sync stats and problems.
              </p>
              <form onSubmit={handleConnect} className="flex flex-col gap-3 mt-4">
                <input
                  type="text"
                  placeholder="Enter LeetCode Username"
                  value={connectUsername}
                  onChange={(e) => setConnectUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-base placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[48px]"
                />
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-base hover:shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] transition-all duration-200 min-h-[48px] flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isConnecting ? "Connecting..." : "Connect"}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-panel p-6 sm:p-8 text-left animate-slide-up md:col-span-2" style={{ animationDelay: "0.1s" }}>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 mb-8 border-b border-[var(--glass-border)]">
                 <div className="flex items-center gap-4">
                    {leetcodeData?.profile?.avatar && (
                       <img src={leetcodeData.profile.avatar} alt="avatar" className="w-14 h-14 rounded-full border-2 border-[var(--accent)] object-cover shadow-md" />
                    )}
                    <div>
                       <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-h)] gradient-text leading-tight mb-0.5">
                         {profileData.leetcode_username}
                       </h3>
                       <span className="text-sm font-medium text-[var(--text)]">
                         Rank: {leetcodeData?.profile?.ranking || "N/A"}
                       </span>
                    </div>
                 </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <button
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="px-5 py-3 rounded-xl border border-[var(--accent)] text-[var(--accent)] font-bold text-base bg-transparent hover:bg-[var(--accent-bg)] active:scale-[0.98] transition-all duration-200 min-h-[48px] flex items-center justify-center cursor-pointer flex-1 sm:flex-initial disabled:opacity-60"
                    >
                      {isSyncing ? "Syncing..." : "Sync with LeetCode"}
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={isImporting}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-base hover:shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] transition-all duration-200 min-h-[48px] flex items-center justify-center cursor-pointer flex-1 sm:flex-initial disabled:opacity-60"
                    >
                      {isImporting ? "Importing..." : "Import My LeetCode Problems"}
                    </button>
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 text-center hover-lift">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-1">Reputation</span>
                  <h4 className="text-xl sm:text-2xl font-extrabold text-[var(--text-h)]">{leetcodeData?.profile?.reputation || 0}</h4>
                </div>
                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 text-center hover-lift">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-1">Country</span>
                  <h4 className="text-xl sm:text-2xl font-extrabold text-[var(--text-h)] truncate">{leetcodeData?.profile?.country || "N/A"}</h4>
                </div>
                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 text-center hover-lift">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-1">School</span>
                  <h4 className="text-sm sm:text-base font-bold text-[var(--text-h)] truncate mt-1">{leetcodeData?.profile?.school || "N/A"}</h4>
                </div>
                <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 text-center hover-lift">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-1">Contest Rating</span>
                  <h4 className="text-xl sm:text-2xl font-extrabold text-[var(--text-h)]">{leetcodeData?.contest?.contestRating ? Math.round(leetcodeData.contest.contestRating) : "N/A"}</h4>
                </div>
              </div>

              {contestHistoryData.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-base sm:text-lg font-bold text-[var(--text-h)] mb-4">Contest Rating History</h4>
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-5">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={contestHistoryData}
                        margin={
                          isMobile
                            ? { top: 10, right: 10, left: -10, bottom: 5 }
                            : { top: 20, right: 30, left: 20, bottom: 5 }
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" stroke="var(--text)" fontSize={12} tickLine={false} />
                        <YAxis domain={['auto', 'auto']} stroke="var(--text)" fontSize={12} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '8px' }}
                          itemStyle={{ color: 'var(--text-h)' }}
                        />
                        <Line type="monotone" dataKey="rating" stroke="#aa3bff" strokeWidth={3} dot={{ r: 3, fill: '#aa3bff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Profile;
