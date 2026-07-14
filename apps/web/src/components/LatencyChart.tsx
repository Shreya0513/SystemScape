"use client";

import { useMemo, useState } from "react";
import type { CacheEvent } from "@/lib/types";

const SERIES = {
  redis: { label: "Redis", color: "#3987e5" },
  database: { label: "Database", color: "#199e70" },
} as const;

type SeriesKey = keyof typeof SERIES;

interface Bar {
  key: string;
  latencyMs: number;
  series: SeriesKey;
  requestKey: string;
}

function seriesFor(type: CacheEvent["type"]): SeriesKey | null {
  if (type === "CACHE_HIT") return "redis";
  if (type === "DB_HIT" || type === "DB_MISS") return "database";
  return null;
}

export function LatencyChart({ events }: { events: CacheEvent[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const bars = useMemo<Bar[]>(() => {
    const relevant = events
      .filter((e) => seriesFor(e.type) !== null)
      .slice(0, 12)
      .reverse();
    return relevant.map((e, i) => ({
      key: `${e.timestamp}-${i}`,
      latencyMs: e.latencyMs,
      series: seriesFor(e.type) as SeriesKey,
      requestKey: e.key,
    }));
  }, [events]);

  if (bars.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Latency</h2>
        <p className="text-xs text-slate-600 italic py-6 text-center">
          Send a request to see latency per hop.
        </p>
      </div>
    );
  }

  const max = Math.max(...bars.map((b) => b.latencyMs), 10);
  const width = 320;
  const height = 120;
  const barGap = 4;
  const barWidth = Math.min(24, width / bars.length - barGap);
  const baselineY = height - 18;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Latency (last 12 hops)</h2>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          {Object.entries(SERIES).map(([key, s]) => (
            <span key={key} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28" role="img" aria-label="Latency per recent request">
        <line x1={0} y1={baselineY} x2={width} y2={baselineY} stroke="#334155" strokeWidth={1} />
        {bars.map((bar, i) => {
          const x = i * (barWidth + barGap);
          const barHeight = Math.max(2, (bar.latencyMs / max) * (baselineY - 8));
          const y = baselineY - barHeight;
          const isHovered = hovered === i;
          return (
            <g key={bar.key}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={SERIES[bar.series].color}
                opacity={isHovered ? 1 : 0.85}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              {isHovered && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={700}
                  fill="#e2e8f0"
                >
                  {bar.latencyMs}ms
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
