"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { CacheGraph } from "@/components/CacheGraph";
import { HitRatioMeter } from "@/components/HitRatioMeter";
import { StreakBadge } from "@/components/StreakBadge";
import { EventLog } from "@/components/EventLog";
import { useCacheEvents } from "@/lib/useCacheEvents";
import type { CacheEvent } from "@/lib/types";

const REDIS_LAB_URL =
  process.env.NEXT_PUBLIC_REDIS_LAB_URL ?? "http://localhost:8081";

const USERS = [
  { id: "1", name: "Alice", emoji: "👩" },
  { id: "2", name: "Bob", emoji: "🧑" },
  { id: "3", name: "Carol", emoji: "👩‍🦰" },
];

export default function Home() {
  const [events, setEvents] = useState<CacheEvent[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [streak, setStreak] = useState(0);

  const handleEvent = useCallback((event: CacheEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 30));
    if (event.type === "CACHE_HIT") {
      setHits((h) => h + 1);
      setStreak((s) => s + 1);
    }
    if (event.type === "CACHE_MISS") {
      setMisses((m) => m + 1);
      setStreak(0);
    }
  }, []);

  const { connected } = useCacheEvents(handleEvent);

  const fetchUser = async (id: string) => {
    await fetch(`${REDIS_LAB_URL}/cache/users/${id}`);
  };

  const total = hits + misses;
  const hitRatio = total === 0 ? 0 : Math.round((hits / total) * 100);
  const lastEvent = events[0] ?? null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
              ⚡ Redis Cache Lab
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Send requests and watch the cache work in real time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                connected ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700/50 text-slate-400"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
              {connected ? "Live" : "Connecting…"}
            </span>
            <StreakBadge streak={streak} />
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-3">
          {USERS.map((user) => (
            <motion.button
              key={user.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchUser(user.id)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-sm font-bold shadow-lg shadow-cyan-950/50"
            >
              {user.emoji} GET /users/{user.id}
            </motion.button>
          ))}
        </div>

        <CacheGraph lastEvent={lastEvent} />

        <div className="grid md:grid-cols-2 gap-4">
          <HitRatioMeter ratio={hitRatio} hits={hits} misses={misses} />
          <EventLog events={events} />
        </div>
      </div>
    </main>
  );
}
