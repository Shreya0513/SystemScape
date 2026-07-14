"use client";

import { useMemo, useState } from "react";
import type { RateLimitEvent } from "@/lib/types";

const SERIES = {
  ACCEPTED: { label: "Accepted", color: "#0ca30c" },
  REJECTED: { label: "Rejected", color: "#d03b3b" },
} as const;

export function AcceptRejectChart({ events }: { events: RateLimitEvent[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const bars = useMemo(
    () =>
      events
        .filter((e) => e.type === "ACCEPTED" || e.type === "REJECTED")
        .slice(0, 24)
        .reverse(),
    [events]
  );

  const accepted = bars.filter((b) => b.type === "ACCEPTED").length;
  const rejected = bars.filter((b) => b.type === "REJECTED").length;

  if (bars.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Accepted vs Rejected</h2>
        <p className="text-xs text-slate-600 italic py-6 text-center">Send requests to see the split.</p>
      </div>
    );
  }

  const width = 360;
  const height = 100;
  const barGap = 3;
  const barWidth = Math.min(14, width / bars.length - barGap);
  const baselineY = height - 4;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Accepted vs Rejected (last 24)</h2>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          {Object.entries(SERIES).map(([key, s]) => (
            <span key={key} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24" role="img" aria-label="Accepted vs rejected requests">
        <line x1={0} y1={baselineY} x2={width} y2={baselineY} stroke="#334155" strokeWidth={1} />
        {bars.map((bar, i) => {
          const x = i * (barWidth + barGap);
          const barHeight = baselineY - 8;
          const isHovered = hovered === i;
          return (
            <rect
              key={`${bar.timestamp}-${i}`}
              x={x}
              y={baselineY - barHeight}
              width={barWidth}
              height={barHeight}
              rx={3}
              fill={SERIES[bar.type as "ACCEPTED" | "REJECTED"].color}
              opacity={isHovered ? 1 : 0.85}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>

      <div className="flex gap-4 mt-2 text-xs">
        <span className="text-emerald-400 font-semibold">✅ {accepted} accepted</span>
        <span className="text-rose-400 font-semibold">🚫 {rejected} rejected</span>
      </div>
    </div>
  );
}
