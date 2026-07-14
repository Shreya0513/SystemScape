"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SlidingWindowViz({
  level,
  capacity,
  windowSeconds,
  recentOffsetsMs,
}: {
  level: number;
  capacity: number;
  windowSeconds: number;
  recentOffsetsMs: number[];
}) {
  const receivedAtRef = useRef(Date.now());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    receivedAtRef.current = Date.now();
  }, [recentOffsetsMs]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 80);
    return () => clearInterval(id);
  }, []);

  const windowMs = windowSeconds * 1000;
  const elapsed = now - receivedAtRef.current;
  const liveOffsets = recentOffsetsMs
    .map((o, i) => ({ id: `${o}-${i}`, offset: o + elapsed }))
    .filter((d) => d.offset < windowMs);

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex flex-col items-center gap-4">
      <div className="text-4xl font-extrabold tabular-nums text-cyan-400">
        {liveOffsets.length}
        <span className="text-slate-500 text-lg"> / {capacity}</span>
      </div>

      <div className="relative w-full max-w-sm h-10 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-bold">now</div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-bold">-{windowSeconds}s</div>
        <AnimatePresence>
          {liveOffsets.map((d) => {
            const pct = 100 - (d.offset / windowMs) * 100;
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, left: `${pct}%` }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ left: { duration: 0.08, ease: "linear" }, opacity: { duration: 0.2 } }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-emerald-400 border-2 border-emerald-200/50"
              />
            );
          })}
        </AnimatePresence>
      </div>

      <p className="text-xs text-slate-500 text-center">
        📜 each dot is one request; it slides left and drops off once it's older than {windowSeconds}s
      </p>
    </div>
  );
}
