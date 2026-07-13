"use client";

import { useCallback, useState } from "react";
import { CacheGraph } from "@/components/CacheGraph";
import { useCacheEvents } from "@/lib/useCacheEvents";
import type { CacheEvent } from "@/lib/types";

const REDIS_LAB_URL =
  process.env.NEXT_PUBLIC_REDIS_LAB_URL ?? "http://localhost:8081";

export default function Home() {
  const [events, setEvents] = useState<CacheEvent[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);

  const handleEvent = useCallback((event: CacheEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 20));
    if (event.type === "CACHE_HIT") setHits((h) => h + 1);
    if (event.type === "CACHE_MISS") setMisses((m) => m + 1);
  }, []);

  const { connected } = useCacheEvents(handleEvent);

  const fetchUser = async (id: string) => {
    await fetch(`${REDIS_LAB_URL}/cache/users/${id}`);
  };

  const total = hits + misses;
  const hitRatio = total === 0 ? 0 : Math.round((hits / total) * 100);
  const lastEvent = events[0] ?? null;

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">SystemScape · Redis Cache Lab</h1>
        <p className="text-slate-400 text-sm mt-1">
          WebSocket: {connected ? "connected" : "disconnected"}
        </p>
      </div>

      <div className="flex gap-3">
        {["1", "2", "3"].map((id) => (
          <button
            key={id}
            onClick={() => fetchUser(id)}
            className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-sm font-medium"
          >
            GET /users/{id}
          </button>
        ))}
      </div>

      <CacheGraph lastEvent={lastEvent} />

      <div className="flex gap-6 text-sm">
        <span>Hits: {hits}</span>
        <span>Misses: {misses}</span>
        <span>Hit ratio: {hitRatio}%</span>
      </div>

      <div>
        <h2 className="text-sm font-medium text-slate-400 mb-2">Event log</h2>
        <ul className="space-y-1 text-xs font-mono">
          {events.map((event, i) => (
            <li key={i} className="text-slate-300">
              {event.type} — {event.key} ({event.latencyMs}ms)
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
