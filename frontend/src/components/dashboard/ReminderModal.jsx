import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, BellIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const DAYS_OF_WEEK = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export default function ReminderModal({ isOpen, onClose, onSave, userId }) {
  const [title, setTitle] = useState("LeetCode Reminder");
  const [subject, setSubject] = useState("Time to solve today's LeetCode problems!");
  const [description, setDescription] = useState("Keep the streak alive and stay interview ready.");
  const [time, setTime] = useState("19:00");
  const [frequency, setFrequency] = useState("Daily");
  const [customDays, setCustomDays] = useState([1, 2, 3, 4, 5]); // Monday to Friday
  const [weeklyDay, setWeeklyDay] = useState(1); // Monday
  const [hasExisting, setHasExisting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const modalRef = useRef(null);

  // Detect mobile viewport responsively
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load settings on open
  useEffect(() => {
    if (isOpen && userId) {
      const key = `leetcode_tracker_reminder_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTitle(parsed.title || "LeetCode Reminder");
          setSubject(parsed.subject || "Time to solve today's LeetCode problems!");
          setDescription(parsed.description || parsed.message || "Keep the streak alive and stay interview ready.");
          setTime(parsed.time || "19:00");
          setFrequency(parsed.frequency || "Daily");
          setCustomDays(parsed.customDays || [1, 2, 3, 4, 5]);
          setWeeklyDay(parsed.weeklyDay !== undefined ? parsed.weeklyDay : 1);
          setHasExisting(true);
        } catch (e) {
          console.error("Error parsing reminder settings:", e);
          setHasExisting(false);
        }
      } else {
        // Reset to defaults
        setTitle("LeetCode Reminder");
        setSubject("Time to solve today's LeetCode problems!");
        setDescription("Keep the streak alive and stay interview ready.");
        setTime("19:00");
        setFrequency("Daily");
        setCustomDays([1, 2, 3, 4, 5]);
        setWeeklyDay(1);
        setHasExisting(false);
      }
    }
  }, [isOpen, userId]);

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
    if (!userId) return;

    if (frequency === "Custom" && customDays.length === 0) {
      return toast.error("Please select at least one day for Custom frequency");
    }

    const key = `leetcode_tracker_reminder_${userId}`;
    const settings = {
      enabled: true,
      title: title.trim() || "LeetCode Reminder",
      subject: subject.trim() || "Time to solve today's LeetCode problems!",
      description: description.trim() || "Keep the streak alive and stay interview ready.",
      message: description.trim(), // for backwards compatibility
      time,
      frequency,
      customDays: frequency === "Custom" ? customDays : null,
      weeklyDay: frequency === "Weekly" ? weeklyDay : null,
    };

    localStorage.setItem(key, JSON.stringify(settings));
    // Reset state for today so it will trigger correctly on new schedule
    localStorage.removeItem(`leetcode_tracker_reminder_state_${userId}`);

    toast.success(hasExisting ? "Reminder updated successfully!" : "Reminder saved successfully!");
    
    if (onSave) {
      onSave(settings);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!userId) return;
    if (!window.confirm("Are you sure you want to delete this reminder?")) return;

    localStorage.removeItem(`leetcode_tracker_reminder_${userId}`);
    localStorage.removeItem(`leetcode_tracker_reminder_state_${userId}`);
    
    toast.success("Reminder deleted successfully!");
    
    if (onSave) {
      onSave(null);
    }
    onClose();
  };

  const toggleCustomDay = (dayValue) => {
    if (customDays.includes(dayValue)) {
      setCustomDays(customDays.filter((d) => d !== dayValue));
    } else {
      setCustomDays([...customDays, dayValue].sort());
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
              ref={modalRef}
              tabIndex={-1}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pointer-events-auto w-full max-w-lg rounded-t-3xl md:rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl p-4 md:p-6 h-[85vh] md:h-auto max-h-[85vh] md:max-h-none flex flex-col overflow-hidden outline-none"
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
                    🔔 Advanced Reminder Settings
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

              {/* Scrollable Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 pb-4">
                {/* Title */}
                <div>
                  <label htmlFor="reminder-title-input" className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-1">
                    Reminder Title
                  </label>
                  <input
                    id="reminder-title-input"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g., LeetCode Reminder"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-sm focus:outline-none focus:border-[var(--accent)] transition-all duration-200"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="reminder-subject-input" className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-1">
                    Subject
                  </label>
                  <input
                    id="reminder-subject-input"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="e.g., Daily Coding Session"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-sm focus:outline-none focus:border-[var(--accent)] transition-all duration-200"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="reminder-description-input" className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-1">
                    Description
                  </label>
                  <textarea
                    id="reminder-description-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Describe what you want to achieve..."
                    className="w-full min-h-[64px] px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-sm focus:outline-none focus:border-[var(--accent)] transition-all duration-200 resize-none"
                  />
                </div>

                {/* Time & Frequency Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reminder-time-input" className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-1">
                      Reminder Time
                    </label>
                    <input
                      id="reminder-time-input"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-sm focus:outline-none focus:border-[var(--accent)] transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label htmlFor="reminder-frequency-input" className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-1">
                      Frequency
                    </label>
                    <select
                      id="reminder-frequency-input"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-sm focus:outline-none focus:border-[var(--accent)] transition-all duration-200 cursor-pointer"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekdays">Weekdays (Mon-Fri)</option>
                      <option value="Weekly">Weekly (On Specific Day)</option>
                      <option value="Custom">Custom Days</option>
                    </select>
                  </div>
                </div>

                {/* Conditional fields based on frequency */}
                {frequency === "Weekly" && (
                  <div>
                    <label htmlFor="weekly-day-select" className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-1">
                      Choose Day of Week
                    </label>
                    <select
                      id="weekly-day-select"
                      value={weeklyDay}
                      onChange={(e) => setWeeklyDay(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] text-[var(--text-h)] text-sm focus:outline-none focus:border-[var(--accent)] transition-all duration-200 cursor-pointer"
                    >
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                  </div>
                )}

                {frequency === "Custom" && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text)] mb-2">
                      Select Days
                    </span>
                    <div className="flex flex-wrap gap-1.5 justify-between">
                      {DAYS_OF_WEEK.map((day) => {
                        const isSelected = customDays.includes(day.value);
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleCustomDay(day.value)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 min-h-[38px] flex-1 ${
                              isSelected
                                ? "border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]"
                                : "border-[var(--border)] bg-[var(--code-bg)] text-[var(--text)] hover:border-[var(--accent-border)]"
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions row */}
                <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4 border-t border-[var(--border)]">
                  {hasExisting && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="py-2.5 px-4 rounded-xl border border-red-500 text-red-500 font-semibold hover:bg-red-500/10 transition-all duration-200 flex items-center justify-center gap-1.5 order-last sm:order-first"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                  
                  <div className="flex flex-1 gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text-h)] hover:bg-[var(--code-bg)] transition-all duration-200 flex items-center justify-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-200 flex items-center justify-center"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
