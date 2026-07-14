"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEvictionEvents } from "@/lib/useEvictionEvents";
import type { EvictionEvent } from "@/lib/types";

const REDIS_LAB_URL =
  process.env.NEXT_PUBLIC_REDIS_LAB_URL ?? "http://localhost:8081";

const KEYS = ["A", "B", "C", "D", "E", "F"];
const CAPACITY = 4;

export function EvictionVisualizer() {
  const [slots, setSlots] = useState<string[]>([]);
  const [policy, setPolicy] = useState<"LRU" | "LFU">("LRU");
  const [lastEvicted, setLastEvicted] = useState<string | null>(null);
  const [lastAccess, setLastAccess] = useState<{ key: string; hit: boolean } | null>(null);

  const handleEvent = useCallback((event: EvictionEvent) => {
    setSlots(event.slots);
    setPolicy(event.policy);
    if (event.type === "EVICT" && event.evictedKey) {
      setLastEvicted(event.evictedKey);
      setTimeout(() => setLastEvicted(null), 1200);
    }
    if (event.type === "ACCESS_HIT" || event.type === "ACCESS_MISS") {
      setLastAccess({ key: event.key ?? "", hit: event.type === "ACCESS_HIT" });
    }
  }, []);

  const { connected } = useEvictionEvents(handleEvent);

  useEffect(() => {
    fetch(`${REDIS_LAB_URL}/eviction`)
      .then((r) => r.json())
      .then((s) => {
        setSlots(s.slots);
        setPolicy(s.policy);
      })
      .catch(() => {});
  }, []);

  const access = (key: string) => fetch(`${REDIS_LAB_URL}/eviction/access/${key}`, { method: "POST" });
  const setPolicyRemote = (p: "LRU" | "LFU") => fetch(`${REDIS_LAB_URL}/eviction/policy/${p}`, { method: "POST" });
  const reset = () => fetch(`${REDIS_LAB_URL}/eviction`, { method: "DELETE" });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">
          🧠 LRU / LFU Eviction Playground
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            {(["LRU", "LFU"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPolicyRemote(p)}
                className={`px-3 py-1 text-xs font-bold ${
                  policy === p ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={reset}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/50 text-slate-300"
          >
            Reset
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Capacity is {CAPACITY} slots. Access keys below — once the cache is full, the{" "}
        {policy === "LRU" ? "least recently used" : "least frequently used"} key gets evicted.
      </p>

      <div className="flex flex-wrap gap-2">
        {KEYS.map((key) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => access(key)}
            className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-600 to-violet-500 text-sm font-extrabold shadow"
          >
            {key}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-2">
        {Array.from({ length: CAPACITY }).map((_, i) => {
          const key = slots[i];
          const isEvicted = key === undefined && lastEvicted && slots.length < CAPACITY;
          return (
            <div
              key={i}
              className="h-16 w-16 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center relative bg-slate-950/50"
            >
              <AnimatePresence mode="wait">
                {key && (
                  <motion.div
                    key={key}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-lg font-extrabold text-slate-900"
                  >
                    {key}
                  </motion.div>
                )}
              </AnimatePresence>
              {i === 0 && (
                <span className="absolute -bottom-5 text-[10px] text-slate-600 whitespace-nowrap">next to evict</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-6 flex items-center gap-2 pt-2">
        <AnimatePresence>
          {lastEvicted && (
            <motion.span
              key={lastEvicted + "evict"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold"
            >
              🗑️ Evicted {lastEvicted}
            </motion.span>
          )}
          {lastAccess && (
            <motion.span
              key={lastAccess.key + lastAccess.hit}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                lastAccess.hit ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              }`}
            >
              {lastAccess.hit ? `🎯 Hit ${lastAccess.key}` : `💨 Miss ${lastAccess.key}`}
            </motion.span>
          )}
        </AnimatePresence>
        {!connected && <span className="text-xs text-slate-600">connecting…</span>}
      </div>
    </div>
  );
}
