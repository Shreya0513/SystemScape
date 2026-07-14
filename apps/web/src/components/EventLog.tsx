"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { CacheEvent } from "@/lib/types";

const EVENT_STYLE: Record<CacheEvent["type"], { emoji: string; color: string }> = {
  REQUEST: { emoji: "🚀", color: "#3987e5" },
  CACHE_HIT: { emoji: "🎯", color: "#0ca30c" },
  CACHE_MISS: { emoji: "💨", color: "#fab219" },
  DB_HIT: { emoji: "🗄️", color: "#1baf7a" },
  DB_MISS: { emoji: "❌", color: "#d03b3b" },
  CACHE_STORE: { emoji: "💾", color: "#1baf7a" },
  RESPONSE: { emoji: "✅", color: "#3987e5" },
  EVICT: { emoji: "🗑️", color: "#e87ba4" },
};

export function EventLog({ events }: { events: CacheEvent[] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Live event feed</h2>
      <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {events.map((event, i) => {
            const style = EVENT_STYLE[event.type];
            return (
              <motion.li
                key={`${event.timestamp}-${event.type}-${i}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 text-xs font-mono rounded-lg px-2 py-1.5 bg-slate-900/70"
              >
                <span>{style.emoji}</span>
                <span className="font-bold" style={{ color: style.color }}>
                  {event.type.replace("_", " ")}
                </span>
                <span className="text-slate-500 truncate">{event.key}</span>
                <span className="ml-auto text-slate-600 tabular-nums">{event.latencyMs}ms</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
        {events.length === 0 && (
          <li className="text-xs text-slate-600 italic px-2 py-4 text-center">
            Click a button above to send your first request →
          </li>
        )}
      </ul>
    </div>
  );
}
