import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import api from "../../api";
import { useQueryClient } from "@tanstack/react-query";

export default function ChangeUsernameModal({ isOpen, onClose }) {
  const [username, setUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  // Accessibility: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return toast.error("Username cannot be empty");

    setIsSaving(true);
    const toastId = toast.loading("Verifying new username…");
    try {
      await api.put("/leetcode/change", { leetcode_username: trimmed });
      toast.success("Username changed successfully!", { id: toastId });
      await queryClient.invalidateQueries({ queryKey: ["leetcodeProfile"] });
      setUsername("");
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid username or network error";
      toast.error(msg, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <PencilSquareIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-bold text-[var(--text-h)]">
                    Change Username
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text)] hover:bg-[var(--code-bg)] transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-[var(--text)] mb-4 leading-relaxed">
                Enter your new LeetCode username. It will be verified before
                saving.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="New LeetCode username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSaving}
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-sm placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 disabled:opacity-60"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text-h)] hover:bg-[var(--code-bg)] transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSaving ? "Saving…" : "Save"}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
