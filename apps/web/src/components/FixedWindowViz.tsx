"use client";

import { motion } from "framer-motion";

export function FixedWindowViz({
  level,
  capacity,
  windowSeconds,
  windowRemainingMs,
}: {
  level: number;
  capacity: number;
  windowSeconds: number;
  windowRemainingMs: number;
}) {
  const filled = Math.round(level);
  const slots = Array.from({ length: capacity });
  const windowPct = windowSeconds > 0 ? windowRemainingMs / (windowSeconds * 1000) : 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex flex-col items-center gap-4">
      <div className="text-4xl font-extrabold tabular-nums text-cyan-400">
        {filled}
        <span className="text-slate-500 text-lg"> / {capacity}</span>
      </div>

      <div className="grid grid-cols-5 gap-2 max-w-xs">
        {slots.map((_, i) => (
          <motion.div
            key={i}
            animate={{ backgroundColor: i < filled ? "#199e70" : "#1e293b" }}
            transition={{ duration: 0.2 }}
            className="h-8 w-8 rounded-md border border-slate-700"
          />
        ))}
      </div>

      <div className="w-full max-w-xs">
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full bg-violet-500"
            animate={{ width: `${Math.max(0, windowPct) * 100}%` }}
            transition={{ duration: 0.2, ease: "linear" }}
          />
        </div>
        <p className="text-xs text-slate-500 text-center mt-2">
          🪟 window resets every {windowSeconds}s — all {capacity} slots reopen at once
        </p>
      </div>
    </div>
  );
}
