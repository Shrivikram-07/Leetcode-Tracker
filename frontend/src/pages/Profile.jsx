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

import DashboardLayout from "../components/dashboard/DashboardLayout";

function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  
  // Leetcode specific states
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [connectUsername, setConnectUsername] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "light"
  );

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
    >
      {loading ? (
        <p className="text-sm text-[var(--text)]">Loading Profile...</p>
      ) : (
        <div style={styles.grid}>
          {/* Native Profile Card */}
          <div className="glass-panel animate-slide-up hover-lift" style={styles.profileCard}>
            <h3 style={styles.title} className="gradient-text">Tracker Profile</h3>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Username</span>
                <span style={styles.infoValue}>{profileData?.username || "N/A"}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Email</span>
                <span style={styles.infoValue}>{profileData?.email || "N/A"}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Member Since</span>
                <span style={styles.infoValue}>{formatDate(profileData?.created_at)}</span>
              </div>
            </div>
          </div>

          {/* LeetCode Section */}
          {!profileData?.leetcode_username ? (
            <div className="glass-panel animate-slide-up hover-lift" style={{ ...styles.profileCard, animationDelay: "0.1s" }}>
              <h3 style={styles.title}>Connect LeetCode</h3>
              <p style={styles.desc}>Link your public LeetCode username to sync stats and problems.</p>
              <form onSubmit={handleConnect} style={styles.connectForm}>
                <input
                  type="text"
                  placeholder="Enter LeetCode Username"
                  value={connectUsername}
                  onChange={(e) => setConnectUsername(e.target.value)}
                  style={styles.input}
                  required
                />
                <button type="submit" disabled={isConnecting} style={styles.primaryBtn}>
                  {isConnecting ? "Connecting..." : "Connect"}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-panel animate-slide-up" style={{ ...styles.profileCard, gridColumn: "1 / -1", animationDelay: "0.1s" }}>
              <div style={styles.lcHeader}>
                 <div style={styles.lcHeaderLeft}>
                    {leetcodeData?.profile?.avatar && (
                       <img src={leetcodeData.profile.avatar} alt="avatar" style={styles.avatar} />
                    )}
                    <div>
                       <h3 style={{ ...styles.title, borderBottom: 'none', margin: 0 }} className="gradient-text">
                         {profileData.leetcode_username}
                       </h3>
                       <span style={styles.lcRank}>
                         Rank: {leetcodeData?.profile?.ranking || "N/A"}
                       </span>
                    </div>
                 </div>
                 <div style={styles.lcActions}>
                   <button onClick={handleSync} disabled={isSyncing} style={styles.secondaryBtn}>
                     {isSyncing ? "Syncing..." : "Sync with LeetCode"}
                   </button>
                   <button onClick={handleImport} disabled={isImporting} style={styles.primaryBtn}>
                     {isImporting ? "Importing..." : "Import My LeetCode Problems"}
                   </button>
                 </div>
              </div>

              <div style={styles.lcStatsGrid}>
                <div style={styles.lcStatBox}>
                  <span style={styles.lcStatLabel}>Reputation</span>
                  <h4 style={styles.lcStatValue}>{leetcodeData?.profile?.reputation || 0}</h4>
                </div>
                <div style={styles.lcStatBox}>
                  <span style={styles.lcStatLabel}>Country</span>
                  <h4 style={styles.lcStatValue}>{leetcodeData?.profile?.country || "N/A"}</h4>
                </div>
                <div style={styles.lcStatBox}>
                  <span style={styles.lcStatLabel}>School</span>
                  <h4 style={{ ...styles.lcStatValue, fontSize: "16px" }}>{leetcodeData?.profile?.school || "N/A"}</h4>
                </div>
                <div style={styles.lcStatBox}>
                  <span style={styles.lcStatLabel}>Contest Rating</span>
                  <h4 style={styles.lcStatValue}>{leetcodeData?.contest?.contestRating ? Math.round(leetcodeData.contest.contestRating) : "N/A"}</h4>
                </div>
              </div>

              {contestHistoryData.length > 0 && (
                <div style={{ marginTop: "32px" }}>
                  <h4 style={styles.chartTitle}>Contest Rating History</h4>
                  <div style={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={contestHistoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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

const styles = {
  container: {
    padding: "0 24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderBottom: "1px solid var(--border)",
  },
  logoSec: {
    textAlign: "left",
    cursor: "pointer",
  },
  logo: {
    margin: 0,
    fontSize: "22px",
    color: "var(--accent)",
    fontWeight: "700",
  },
  userSec: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  navLink: {
    fontSize: "14px",
    color: "var(--text)",
    cursor: "pointer",
    fontWeight: "500",
    transition: "color 0.2s",
  },
  navLinkActive: {
    color: "var(--accent)",
    fontWeight: "600",
  },
  logoutBtn: {
    background: "none",
    border: "1px solid var(--border)",
    color: "var(--text-h)",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s",
    fontFamily: "var(--sans)",
    fontWeight: "500",
    "&:hover": {
      borderColor: "var(--accent)",
    }
  },
  themeToggleBtn: {
    background: "none",
    border: "1px solid var(--border)",
    color: "var(--text-h)",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s",
    fontFamily: "var(--sans)",
    fontWeight: "500",
    "&:hover": {
      borderColor: "var(--accent)",
    }
  },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    paddingBottom: "48px",
    alignItems: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "24px",
    width: "100%",
    maxWidth: "900px",
  },
  profileCard: {
    padding: "32px",
    textAlign: "left",
  },
  title: {
    margin: "0 0 20px 0",
    color: "var(--text-h)",
    fontWeight: "700",
    fontSize: "24px",
    borderBottom: "1px solid var(--glass-border)",
    paddingBottom: "12px",
  },
  desc: {
    color: "var(--text)",
    fontSize: "14px",
    marginBottom: "16px",
  },
  infoGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px dotted var(--border)",
  },
  infoLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text)",
  },
  infoValue: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--text-h)",
  },
  connectForm: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text-h)",
    fontFamily: "var(--sans)",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
    "&:focus": {
      borderColor: "var(--accent)",
    }
  },
  primaryBtn: {
    background: "var(--gradient-primary)",
    border: "none",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "var(--sans)",
    fontWeight: "600",
    transition: "opacity 0.2s",
  },
  secondaryBtn: {
    background: "transparent",
    border: "1px solid var(--accent)",
    color: "var(--accent)",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "var(--sans)",
    fontWeight: "600",
    transition: "background 0.2s, color 0.2s",
  },
  lcHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "32px",
    borderBottom: "1px solid var(--glass-border)",
    paddingBottom: "16px",
  },
  lcHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  avatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    border: "2px solid var(--accent)",
    objectFit: "cover",
  },
  lcRank: {
    fontSize: "14px",
    color: "var(--text)",
    fontWeight: "500",
  },
  lcActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  lcStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "16px",
  },
  lcStatBox: {
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    borderRadius: "12px",
    padding: "16px",
    textAlign: "center",
  },
  lcStatLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    color: "var(--text)",
    marginBottom: "8px",
  },
  lcStatValue: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "var(--text-h)",
  },
  chartTitle: {
    margin: "0 0 16px 0",
    color: "var(--text-h)",
    fontSize: "18px",
    fontWeight: "600",
  },
  chartContainer: {
    background: "var(--code-bg)",
    borderRadius: "12px",
    padding: "20px 0",
    border: "1px solid var(--border)",
  }
};

export default Profile;
