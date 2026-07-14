"use client";

import { motion } from "framer-motion";

export function LeakyBucketViz({ level, capacity }: { level: number; capacity: number }) {
  const pct = Math.min(1, level / capacity);
  const isFull = level >= capacity - 0.05;

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex flex-col items-center gap-4">
      <div className="text-4xl font-extrabold tabular-nums text-cyan-400">
        {level.toFixed(1)}
        <span className="text-slate-500 text-lg"> / {capacity}</span>
      </div>

      <svg width="120" height="140" viewBox="0 0 120 140">
        <clipPath id="bucketClip">
          <path d="M20 10 L100 10 L88 120 L32 120 Z" />
        </clipPath>
        <path
          d="M20 10 L100 10 L88 120 L32 120 Z"
          fill="none"
          stroke={isFull ? "#d03b3b" : "#334155"}
          strokeWidth={2}
        />
        <motion.rect
          x={20}
          width={80}
          fill="#3987e5"
          opacity={0.75}
          clipPath="url(#bucketClip)"
          animate={{ y: 120 - pct * 110, height: pct * 110 }}
          transition={{ duration: 0.4 }}
        />
        <motion.circle
          cx={60}
          r={3}
          fill="#3987e5"
          animate={{ cy: [122, 138], opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeIn" }}
        />
      </svg>

      <p className="text-xs text-slate-500 text-center">
        🪣 requests fill the queue; it drains at a steady rate — {isFull ? "overflowing, new requests dropped" : "processing steadily"}
      </p>
    </div>
  );
}
