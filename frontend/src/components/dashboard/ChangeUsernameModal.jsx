import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import api from "../../api";
import { useQueryClient } from "@tanstack/react-query";

export default function ChangeUsernameModal({ isOpen, onClose }) {
  const [username, setUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const queryClient = useQueryClient();

  // Detect mobile viewport responsively
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent body scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
      
      // Remove cached queries so previous profile data is cleared instantly
      queryClient.removeQueries({ queryKey: ["leetcodeProfile"] });
      queryClient.removeQueries({ queryKey: ["analytics"] });
      
      // Invalidate to trigger a fresh fetch
      await queryClient.invalidateQueries({ queryKey: ["dashboardUser"] });
      await queryClient.invalidateQueries({ queryKey: ["leetcodeProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["analytics"] });
      
      setUsername("");
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid username or network error";
      toast.error(msg, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const modalVariants = isMobile
    ? {
        hidden: { y: "100%", opacity: 1 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 250 } },
        exit: { y: "100%", opacity: 1, transition: { duration: 0.25 } },
      }
    : {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } },
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
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 pointer-events-auto"
          />

          {/* Modal Container Wrapper */}
          <div className={`fixed inset-0 z-50 pointer-events-none flex ${isMobile ? "flex-col justify-end p-0" : "items-center justify-center p-4"}`}>
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pointer-events-auto w-full max-w-sm rounded-t-3xl md:rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl p-4 md:p-6 h-[80vh] md:h-auto max-h-[80vh] md:max-h-none flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                    <PencilSquareIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-bold text-[var(--text-h)]">
                    Change Username
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text)] hover:bg-[var(--code-bg)] transition-colors min-w-[44px] min-h-[44px]"
                  title="Close modal"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-shrink-0">
                <p className="text-sm text-[var(--text)] mb-4 leading-relaxed">
                  Enter your new LeetCode username. It will be verified before
                  saving.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 pb-4">
                <input
                  type="text"
                  placeholder="New LeetCode username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSaving}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-base placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 disabled:opacity-60 min-h-[48px]"
                />
                <div className="flex gap-3 mt-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-[var(--border)] text-base font-semibold text-[var(--text-h)] hover:bg-[var(--code-bg)] transition-all duration-200 min-h-[48px] flex items-center justify-center"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-base font-semibold hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 min-h-[48px] flex items-center justify-center"
                  >
                    {isSaving ? "Saving…" : "Save"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
