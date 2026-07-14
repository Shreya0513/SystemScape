"use client";

import { motion } from "framer-motion";

export function TokenBucketViz({ level, capacity }: { level: number; capacity: number }) {
  const filled = Math.round(level);
  const dots = Array.from({ length: capacity });

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex flex-col items-center gap-4">
      <div className="text-4xl font-extrabold tabular-nums text-cyan-400">
        {level.toFixed(1)}
        <span className="text-slate-500 text-lg"> / {capacity}</span>
      </div>
      <div className="flex flex-wrap justify-center gap-2 max-w-xs">
        {dots.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              backgroundColor: i < filled ? "#eda100" : "#1e293b",
              scale: i < filled ? 1 : 0.85,
            }}
            transition={{ duration: 0.3 }}
            className="h-6 w-6 rounded-full border border-slate-700"
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">🪙 tokens refill continuously — each request consumes one</p>
    </div>
  );
}
