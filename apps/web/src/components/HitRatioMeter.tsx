"use client";

import { motion } from "framer-motion";

function ratioColor(ratio: number): string {
  if (ratio >= 70) return "#0ca30c"; // good
  if (ratio >= 40) return "#fab219"; // warning
  return "#d03b3b"; // critical
}

export function HitRatioMeter({ ratio, hits, misses }: { ratio: number; hits: number; misses: number }) {
  const color = ratioColor(ratio);
  const total = hits + misses;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Cache Hit Ratio</span>
        <span className="text-2xl font-extrabold tabular-nums" style={{ color }}>
          {total === 0 ? "—" : `${ratio}%`}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${ratio}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <div className="flex gap-4 mt-3 text-xs">
        <span className="flex items-center gap-1 text-emerald-400 font-semibold">🎯 {hits} hits</span>
        <span className="flex items-center gap-1 text-amber-400 font-semibold">💨 {misses} misses</span>
      </div>
    </div>
  );
}
