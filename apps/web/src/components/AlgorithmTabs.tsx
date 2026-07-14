"use client";

import { motion } from "framer-motion";
import type { RateLimitAlgorithm } from "@/lib/types";

const TABS: { id: RateLimitAlgorithm; label: string; emoji: string }[] = [
  { id: "TOKEN_BUCKET", label: "Token Bucket", emoji: "🪙" },
  { id: "LEAKY_BUCKET", label: "Leaky Bucket", emoji: "🪣" },
  { id: "FIXED_WINDOW", label: "Fixed Window", emoji: "🪟" },
  { id: "SLIDING_WINDOW", label: "Sliding Window", emoji: "📜" },
];

export function AlgorithmTabs({
  active,
  onChange,
}: {
  active: RateLimitAlgorithm;
  onChange: (algorithm: RateLimitAlgorithm) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(tab.id)}
            className={`relative px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              isActive ? "text-slate-900" : "text-slate-400 bg-slate-800 hover:bg-slate-700"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="algorithm-tab-bg"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-300 to-orange-400"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative">{tab.emoji} {tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
