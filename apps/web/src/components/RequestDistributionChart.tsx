"use client";

import type { ServerSnapshot } from "@/lib/types";

const COLORS = ["#3987e5", "#199e70", "#c98500", "#9085e9", "#d95926", "#d55181"];

export function RequestDistributionChart({ servers }: { servers: ServerSnapshot[] }) {
  const max = Math.max(...servers.map((s) => s.totalRequests), 1);

  if (servers.every((s) => s.totalRequests === 0)) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Request Distribution</h2>
        <p className="text-xs text-slate-600 italic py-6 text-center">Send requests to see the split across servers.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Request Distribution</h2>
      <div className="space-y-2">
        {servers.map((server, i) => (
          <div key={server.id} className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-16 shrink-0">{server.id}</span>
            <div className="flex-1 h-4 rounded-md bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-md transition-all duration-300"
                style={{
                  width: `${(server.totalRequests / max) * 100}%`,
                  background: COLORS[i % COLORS.length],
                }}
              />
            </div>
            <span className="text-xs font-bold text-slate-300 tabular-nums w-8 text-right">{server.totalRequests}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
