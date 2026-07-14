"use client";

import { motion, AnimatePresence } from "framer-motion";

export function StreakBadge({ streak }: { streak: number }) {
  if (streak < 2) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={streak}
        initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-slate-900 text-xs font-extrabold shadow-lg"
      >
        🔥 {streak} hit streak
      </motion.div>
    </AnimatePresence>
  );
}
