"use client";

import { motion } from "framer-motion";
import type { LbAlgorithm } from "@/lib/types";

const TABS: { id: LbAlgorithm; label: string; emoji: string }[] = [
  { id: "ROUND_ROBIN", label: "Round Robin", emoji: "🔁" },
  { id: "LEAST_CONNECTIONS", label: "Least Connections", emoji: "🔗" },
  { id: "WEIGHTED_ROUND_ROBIN", label: "Weighted RR", emoji: "⚖️" },
  { id: "IP_HASH", label: "IP Hash", emoji: "🧭" },
  { id: "RANDOM", label: "Random", emoji: "🎲" },
];

export function LbAlgorithmTabs({
  active,
  onChange,
}: {
  active: LbAlgorithm;
  onChange: (algorithm: LbAlgorithm) => void;
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
                layoutId="lb-algorithm-tab-bg"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-300 to-cyan-400"
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
