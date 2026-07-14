"use client";

export function TtlControl({ ttl, onChange }: { ttl: number; onChange: (ttl: number) => void }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-baseline justify-between mb-2">
        <label htmlFor="ttl" className="text-xs font-bold uppercase tracking-wide text-slate-400">
          ⏱️ Cache TTL
        </label>
        <span className="text-lg font-extrabold text-cyan-400 tabular-nums">{ttl}s</span>
      </div>
      <input
        id="ttl"
        type="range"
        min={5}
        max={120}
        step={5}
        value={ttl}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-500"
      />
      <p className="text-xs text-slate-500 mt-2">
        Entries expire from Redis after this many seconds. Lower it to see more cache misses.
      </p>
    </div>
  );
}
