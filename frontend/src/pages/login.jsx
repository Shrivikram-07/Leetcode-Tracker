import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { CodeBracketSquareIcon, EnvelopeIcon, KeyIcon } from "@heroicons/react/24/outline";

function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginUser = async () => {
    setError("");
    setSuccess(false);
    setIsSubmitting(true);
    try {
      const res = await api.post("/users/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      queryClient.clear();

      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 relative overflow-hidden text-left">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 mx-auto">
        {/* Left Side: Auth Forms */}
        <div className="w-full max-w-md mx-auto space-y-6 flex flex-col justify-center animate-slide-up">
          {/* Top Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <CodeBracketSquareIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-bold text-[var(--text-h)] leading-tight">
              LeetCode<span className="text-[var(--accent)] font-extrabold">Tracker</span>
            </span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-h)] leading-tight tracking-tight mt-0 mb-2">
              LeetCode Tracker
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
              Track your coding journey, visualize your progress, and stay interview-ready.
            </p>
          </div>

          {/* Glass Card Form */}
          <div className="glass-panel p-6 sm:p-8 hover-lift w-full relative">
            <h2 className="text-lg font-bold text-[var(--text-h)] mb-6 mt-0">
              Welcome back
            </h2>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold text-center">
                Login Successful! Redirecting...
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                loginUser();
              }}
              className="flex flex-col gap-4"
            >
              {/* Email */}
              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 text-[var(--text)] opacity-60 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-sm placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all duration-200 min-h-[48px]"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <KeyIcon className="w-5 h-5 text-[var(--text)] opacity-60 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-sm placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all duration-200 min-h-[48px]"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] transition-all duration-200 min-h-[48px] flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Logging In..." : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-xs text-[var(--text)] text-center">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[var(--accent)] hover:underline font-bold transition-all duration-200"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Mockup Preview Illustration (Hidden on Mobile/Tablet) */}
        <div className="hidden lg:flex flex-col items-center justify-center relative select-none animate-slide-up" style={{ animationDelay: "0.15s" }}>
          {/* Float container */}
          <div className="w-full max-w-md relative p-8 rounded-3xl border border-[var(--border)] bg-[var(--code-bg)]/30 backdrop-blur-md shadow-2xl flex flex-col gap-6 animate-pulse-subtle">
            {/* Window header */}
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="text-[10px] font-mono text-[var(--text)] ml-2">leetcode_tracker_dashboard.sh</span>
            </div>

            {/* Simulated UI Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]/80 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[var(--text)] uppercase tracking-wider">Total Solved</span>
                <span className="text-2xl font-extrabold text-[var(--text-h)]">642</span>
                <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full" style={{ width: "70%" }} />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]/80 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[var(--text)] uppercase tracking-wider">Streak</span>
                <span className="text-2xl font-extrabold text-orange-500 flex items-center gap-1">
                  🔥 18 <span className="text-xs font-semibold text-[var(--text)]">days</span>
                </span>
                <span className="text-[9px] text-emerald-500 font-medium">Top 5% Consistency</span>
              </div>
            </div>

            {/* Simulated Chart Area */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]/80 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--text)] uppercase tracking-wider">Rating Progression</span>
                <span className="text-xs font-bold text-[var(--accent)]">Guardian (1,842)</span>
              </div>
              {/* Simulated SVG Graph */}
              <svg viewBox="0 0 300 100" className="w-full h-24 overflow-visible">
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="var(--border)" strokeDasharray="3,3" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="var(--border)" strokeDasharray="3,3" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="var(--border)" strokeDasharray="3,3" />
                {/* Area under curve */}
                <path d="M 0 90 Q 50 70, 100 65 T 200 40 T 300 10 L 300 100 L 0 100 Z" fill="url(#chartGlow)" />
                {/* Curve Line */}
                <path d="M 0 90 Q 50 70, 100 65 T 200 40 T 300 10" fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" />
                {/* Glowing points */}
                <circle cx="300" cy="10" r="4.5" fill="var(--accent)" stroke="#fff" strokeWidth="1.5" />
              </svg>
            </div>

            {/* List mockup */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[var(--text)] uppercase tracking-wider">Recent Submissions</span>
              {[
                { name: "3Sum", diff: "Medium", color: "text-amber-500 bg-amber-500/10" },
                { name: "Trapping Rain Water", diff: "Hard", color: "text-red-500 bg-red-500/10" },
              ].map((prob, index) => (
                <div key={index} className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]/80 flex items-center justify-between text-xs font-semibold">
                  <span className="text-[var(--text-h)]">{prob.name}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${prob.color}`}>{prob.diff}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;