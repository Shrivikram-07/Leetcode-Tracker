import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LinkIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import api from "../../api";
import { useQueryClient } from "@tanstack/react-query";

export default function ConnectCard() {
  const [username, setUsername] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const queryClient = useQueryClient();

  const handleConnect = async (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return toast.error("Username cannot be empty");

    setIsConnecting(true);
    const toastId = toast.loading("Verifying LeetCode username…");
    try {
      await api.post("/leetcode/connect", { leetcode_username: trimmed });
      toast.success("Account connected successfully!", { id: toastId });
      // Invalidate so the dashboard re-fetches
      await queryClient.invalidateQueries({ queryKey: ["leetcodeProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["analytics"] });
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid username or network error";
      toast.error(msg, { id: toastId });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        {/* Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-8 shadow-xl shadow-black/5">
          {/* Icon header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30">
              <LinkIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-h)] mb-2">
              Connect LeetCode Account
            </h2>
            <p className="text-sm text-[var(--text)] max-w-xs leading-relaxed">
              Enter your LeetCode username to sync your stats, contest data,
              and solved problems.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleConnect} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="e.g. your_leetcode_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isConnecting}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-sm placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 disabled:opacity-60"
            />
            <motion.button
              whileHover={{ scale: isConnecting ? 1 : 1.02 }}
              whileTap={{ scale: isConnecting ? 1 : 0.98 }}
              type="submit"
              disabled={isConnecting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isConnecting ? "Connecting…" : "Connect Account"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
