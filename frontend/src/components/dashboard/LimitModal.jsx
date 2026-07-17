import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function LimitModal({ isOpen, onClose }) {
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

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-sm rounded-2xl border border-[var(--accent-border)] bg-gradient-to-b from-[var(--bg)] to-[var(--code-bg)] shadow-2xl p-6 flex flex-col text-center overflow-hidden relative"
            >
              {/* Decorative top gradient edge */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text)] hover:bg-[var(--code-bg)] hover:text-[var(--text-h)] transition-colors duration-200"
                aria-label="Close"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>

              {/* Sparkle Icon */}
              <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 mb-4 mt-2">
                <SparklesIcon className="w-6 h-6 animate-pulse" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-[var(--text-h)] mb-2">
                Track Limit Reached
              </h3>
              <p className="text-base font-extrabold text-[var(--accent)] mb-3 leading-snug">
                You can only track up to 15 custom problems.
              </p>
              <p className="text-xs text-[var(--text)] leading-relaxed mb-6">
                Upgrade to Premium to track unlimited problems, access advanced analytics, and get personalized AI interview predictions.
              </p>

              {/* Action Button */}
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-200 active:scale-[0.98]"
              >
                Got It
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
