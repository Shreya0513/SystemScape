"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ServerSnapshot } from "@/lib/types";

const LOAD_BALANCER_URL =
  process.env.NEXT_PUBLIC_LOAD_BALANCER_URL ?? "http://localhost:8083";

function post(path: string) {
  return fetch(`${LOAD_BALANCER_URL}${path}`, { method: "POST" });
}

export function ServerPool({
  servers,
  justRoutedId,
  onChanged,
}: {
  servers: ServerSnapshot[];
  justRoutedId: string | null;
  onChanged: () => void;
}) {
  const addServer = () => post("/lb/servers?weight=1").then(onChanged);
  const removeServer = (id: string) =>
    fetch(`${LOAD_BALANCER_URL}/lb/servers/${id}`, { method: "DELETE" }).then(onChanged);
  const kill = (id: string) => post(`/lb/servers/${id}/kill`).then(onChanged);
  const revive = (id: string) => post(`/lb/servers/${id}/revive`).then(onChanged);
  const setWeight = (id: string, value: number) => post(`/lb/servers/${id}/weight?value=${value}`).then(onChanged);
  const setLatency = (id: string, ms: number) => post(`/lb/servers/${id}/latency?ms=${ms}`).then(onChanged);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Server Pool</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addServer}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold"
        >
          + Add server
        </motion.button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {servers.map((server) => {
            const isRouted = server.id === justRoutedId;
            return (
              <motion.div
                key={server.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: server.alive ? 1 : 0.5,
                  scale: isRouted ? 1.02 : 1,
                  boxShadow: isRouted ? "0 0 24px #22d3ee" : "0 0 0px transparent",
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25 }}
                className={`rounded-2xl border p-4 space-y-2 ${
                  server.alive ? "border-slate-800 bg-slate-900/60" : "border-rose-900/50 bg-rose-950/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">
                    {server.alive ? "🖥️" : "💀"} {server.id}
                  </span>
                  <div className="flex gap-1">
                    {server.alive ? (
                      <button
                        onClick={() => kill(server.id)}
                        className="px-2 py-1 text-[10px] font-bold rounded-md bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                      >
                        Kill
                      </button>
                    ) : (
                      <button
                        onClick={() => revive(server.id)}
                        className="px-2 py-1 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      >
                        Revive
                      </button>
                    )}
                    <button
                      onClick={() => removeServer(server.id)}
                      className="px-2 py-1 text-[10px] font-bold rounded-md bg-slate-800 text-slate-400 hover:bg-slate-700"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex-1">Active connections</span>
                  <span className="font-bold text-cyan-400 tabular-nums">{server.activeConnections}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-cyan-500"
                    animate={{ width: `${Math.min(100, server.activeConnections * 20)}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Weight</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={server.weight}
                    onChange={(e) => setWeight(server.id, Number(e.target.value))}
                    className="flex-1 accent-emerald-500"
                  />
                  <span className="font-bold text-slate-300 w-4 text-right">{server.weight}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Latency</span>
                  <input
                    type="range"
                    min={10}
                    max={500}
                    step={10}
                    value={server.latencyMs}
                    onChange={(e) => setLatency(server.id, Number(e.target.value))}
                    className="flex-1 accent-amber-500"
                  />
                  <span className="font-bold text-slate-300 w-10 text-right">{server.latencyMs}ms</span>
                </div>

                <div className="text-[11px] text-slate-500">Total requests: {server.totalRequests}</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
