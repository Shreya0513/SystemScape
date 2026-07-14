"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CacheEvent } from "@/lib/types";

const REDIS_LAB_URL =
  process.env.NEXT_PUBLIC_REDIS_LAB_URL ?? "http://localhost:8081";

const USER_IDS = ["1", "2", "3"];

interface DemoResult {
  demo: string;
  headline: string;
  detail: string;
  tone: "good" | "warning" | "critical";
}

function getUser(id: string, ttlSeconds?: number) {
  const q = ttlSeconds !== undefined ? `?ttlSeconds=${ttlSeconds}` : "";
  return fetch(`${REDIS_LAB_URL}/cache/users/${id}${q}`);
}

function evictUser(id: string) {
  return fetch(`${REDIS_LAB_URL}/cache/users/${id}`, { method: "DELETE" });
}

export function CacheDemos({ events }: { events: CacheEvent[] }) {
  const eventsRef = useRef(events);
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<DemoResult | null>(null);

  async function measure<T extends DemoResult>(
    demo: string,
    action: () => Promise<void>,
    summarize: (newEvents: CacheEvent[]) => T
  ) {
    setRunning(demo);
    setResult(null);
    const startLen = eventsRef.current.length;
    await action();
    await new Promise((r) => setTimeout(r, 500));
    const newEvents = eventsRef.current.slice(0, eventsRef.current.length - startLen);
    setResult(summarize(newEvents));
    setRunning(null);
  }

  const runWarming = () =>
    measure(
      "warming",
      async () => {
        await Promise.all(USER_IDS.map((id) => evictUser(id)));
        for (const id of USER_IDS) {
          await getUser(id, 60);
        }
      },
      (newEvents) => {
        const stored = newEvents.filter((e) => e.type === "CACHE_STORE").length;
        return {
          demo: "warming",
          headline: `🔥 Pre-warmed ${stored}/${USER_IDS.length} keys`,
          detail: "Every one of those requests will now be a cache hit before a single real user asks for it.",
          tone: "good",
        };
      }
    );

  const runPenetration = () =>
    measure(
      "penetration",
      async () => {
        await Promise.all(Array.from({ length: 8 }).map(() => getUser("999")));
      },
      (newEvents) => {
        const dbMisses = newEvents.filter((e) => e.type === "DB_MISS").length;
        return {
          demo: "penetration",
          headline: `❌ ${dbMisses}/8 requests hit the DB for nothing`,
          detail: "Querying a key that never exists can never populate the cache — every request pays full DB latency, forever. (Fix: cache the negative result, or a bloom filter.)",
          tone: "critical",
        };
      }
    );

  const runAvalanche = () =>
    measure(
      "avalanche",
      async () => {
        await Promise.all(USER_IDS.map((id) => evictUser(id)));
        await Promise.all(USER_IDS.map((id) => getUser(id, 3)));
        await new Promise((r) => setTimeout(r, 3300));
        await Promise.all(USER_IDS.map((id) => getUser(id, 3)));
      },
      (newEvents) => {
        const dbHits = newEvents.filter((e) => e.type === "DB_HIT").length;
        return {
          demo: "avalanche",
          headline: `⛰️ ${dbHits} keys expired together → ${dbHits} simultaneous DB hits`,
          detail: "Same TTL on every key means they all expire at once and the database takes the full traffic spike at the same instant. (Fix: jitter your TTLs.)",
          tone: "warning",
        };
      }
    );

  const runStampede = () =>
    measure(
      "stampede",
      async () => {
        await evictUser("1");
        await Promise.all(Array.from({ length: 10 }).map(() => getUser("1")));
      },
      (newEvents) => {
        const dbHits = newEvents.filter((e) => e.type === "DB_HIT" && e.key === "users:1").length;
        return {
          demo: "stampede",
          headline: `🐄 ${dbHits}/10 concurrent requests hit the DB for the same key`,
          detail: "As soon as one key expires, every simultaneous request races to the database instead of one request refilling the cache for everyone. (Fix: a distributed lock — see Module 6.)",
          tone: dbHits > 1 ? "critical" : "good",
        };
      }
    );

  const demos = [
    { id: "warming", label: "🔥 Cache Warming", run: runWarming, color: "from-emerald-600 to-emerald-500" },
    { id: "penetration", label: "❌ Penetration", run: runPenetration, color: "from-rose-600 to-rose-500" },
    { id: "avalanche", label: "⛰️ Avalanche", run: runAvalanche, color: "from-amber-600 to-amber-500" },
    { id: "stampede", label: "🐄 Stampede", run: runStampede, color: "from-violet-600 to-violet-500" },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Failure & Optimization Demos</h2>
      <div className="flex flex-wrap gap-2">
        {demos.map((demo) => (
          <motion.button
            key={demo.id}
            whileHover={{ scale: running ? 1 : 1.05 }}
            whileTap={{ scale: running ? 1 : 0.95 }}
            disabled={running !== null}
            onClick={demo.run}
            className={`px-3 py-2 rounded-xl bg-gradient-to-r ${demo.color} text-xs font-bold shadow disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {running === demo.id ? "⏳ Running…" : demo.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.demo + result.headline}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl p-3 border text-sm ${
              result.tone === "good"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : result.tone === "warning"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <p className="font-bold">{result.headline}</p>
            <p className="text-xs opacity-80 mt-1">{result.detail}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
