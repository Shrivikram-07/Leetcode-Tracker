import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, BellIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function ReminderModal({ isOpen, onClose, onSave }) {
  const [time, setTime] = useState("19:00");
  const [frequency, setFrequency] = useState("Daily");
  const [message, setMessage] = useState("Time to solve today's LeetCode problem!");
  const [isMobile, setIsMobile] = useState(false);
  const modalRef = useRef(null);

  // Detect mobile viewport responsively
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load from localStorage on open
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("leetcode_tracker_reminder");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTime(parsed.time || "19:00");
          setFrequency(parsed.frequency || "Daily");
          setMessage(parsed.message || "Time to solve today's LeetCode problem!");
        } catch (e) {
          console.error("Error parsing reminder settings:", e);
        }
      } else {
        // Reset to defaults
        setTime("19:00");
        setFrequency("Daily");
        setMessage("Time to solve today's LeetCode problem!");
      }
    }
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
      // Focus modal container when opened
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const existing = localStorage.getItem("leetcode_tracker_reminder");
    
    const settings = {
      enabled: true,
      time,
      frequency,
      message: message.trim() || "Time to solve today's LeetCode problem!"
    };

    localStorage.setItem("leetcode_tracker_reminder", JSON.stringify(settings));

    if (existing) {
      toast.success("Reminder updated successfully!");
    } else {
      toast.success("Reminder saved successfully!");
    }

    if (onSave) {
      onSave(settings);
    }
    onClose();
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
              ref={modalRef}
              tabIndex={-1}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pointer-events-auto w-full max-w-md rounded-t-3xl md:rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl p-6 h-[80vh] md:h-auto max-h-[80vh] md:max-h-none flex flex-col overflow-hidden outline-none"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reminder-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                    <BellIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 id="reminder-title" className="text-base font-bold text-[var(--text-h)]">
                    🔔 Reminder Settings
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text)] hover:bg-[var(--code-bg)] hover:text-[var(--text-h)] transition-colors duration-200 min-w-[44px] min-h-[44px]"
                  aria-label="Close settings"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable content area */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col gap-5 pr-1 pb-4">
                {/* Time Picker */}
                <div>
                  <label htmlFor="reminder-time" className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-2">
                    Reminder Time
                  </label>
                  <input
                    id="reminder-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-base focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 min-h-[48px]"
                  />
                </div>

                {/* Frequency Selectors */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-3">
                    Frequency
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {["Daily", "Weekdays", "Weekly"].map((freq) => (
                      <label
                        key={freq}
                        className={`flex flex-col items-center justify-center px-3 py-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-200 min-h-[48px] ${
                          frequency === freq
                            ? "border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]"
                            : "border-[var(--border)] bg-[var(--code-bg)] text-[var(--text)] hover:text-[var(--text-h)] hover:border-[var(--accent-border)]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="frequency"
                          value={freq}
                          checked={frequency === freq}
                          onChange={() => setFrequency(freq)}
                          className="sr-only"
                        />
                        {freq}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message TextArea */}
                <div>
                  <label htmlFor="reminder-message" className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-2">
                    Reminder Message
                  </label>
                  <textarea
                    id="reminder-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter custom reminder message..."
                    className="w-full min-h-[96px] px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-base placeholder:text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-auto pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-[var(--border)] text-base font-semibold text-[var(--text-h)] hover:bg-[var(--code-bg)] transition-all duration-200 min-h-[48px] flex items-center justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-base font-semibold hover:shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] transition-all duration-200 min-h-[48px] flex items-center justify-center"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
