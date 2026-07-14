"use client";

import type { RateLimitAlgorithm } from "@/lib/types";

const RATE_BASED = new Set<RateLimitAlgorithm>(["TOKEN_BUCKET", "LEAKY_BUCKET"]);
const WINDOW_BASED = new Set<RateLimitAlgorithm>(["FIXED_WINDOW", "SLIDING_WINDOW"]);

export function RateLimiterControls({
  algorithm,
  capacity,
  ratePerSecond,
  windowSeconds,
  onCapacityChange,
  onRateChange,
  onWindowChange,
}: {
  algorithm: RateLimitAlgorithm;
  capacity: number;
  ratePerSecond: number;
  windowSeconds: number;
  onCapacityChange: (v: number) => void;
  onRateChange: (v: number) => void;
  onWindowChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Settings</h2>

      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label className="text-xs text-slate-400">Capacity</label>
          <span className="text-sm font-bold text-cyan-400 tabular-nums">{capacity}</span>
        </div>
        <input
          type="range"
          min={1}
          max={30}
          value={capacity}
          onChange={(e) => onCapacityChange(Number(e.target.value))}
          className="w-full accent-cyan-500"
        />
      </div>

      {RATE_BASED.has(algorithm) && (
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <label className="text-xs text-slate-400">
              {algorithm === "TOKEN_BUCKET" ? "Refill rate" : "Leak (drain) rate"}
            </label>
            <span className="text-sm font-bold text-cyan-400 tabular-nums">{ratePerSecond}/sec</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={10}
            step={0.5}
            value={ratePerSecond}
            onChange={(e) => onRateChange(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>
      )}

      {WINDOW_BASED.has(algorithm) && (
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <label className="text-xs text-slate-400">Window length</label>
            <span className="text-sm font-bold text-cyan-400 tabular-nums">{windowSeconds}s</span>
          </div>
          <input
            type="range"
            min={2}
            max={30}
            value={windowSeconds}
            onChange={(e) => onWindowChange(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>
      )}
    </div>
  );
}
