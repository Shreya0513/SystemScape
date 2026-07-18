"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AlgorithmTabs } from "@/components/AlgorithmTabs";
import { TokenBucketViz } from "@/components/TokenBucketViz";
import { LeakyBucketViz } from "@/components/LeakyBucketViz";
import { FixedWindowViz } from "@/components/FixedWindowViz";
import { SlidingWindowViz } from "@/components/SlidingWindowViz";
import { RateLimiterControls } from "@/components/RateLimiterControls";
import { AcceptRejectChart } from "@/components/AcceptRejectChart";
import { AuthButton } from "@/components/AuthButton";
import { useRateLimitEvents } from "@/lib/useRateLimitEvents";
import type { RateLimitAlgorithm, RateLimitEvent } from "@/lib/types";

const RATE_LIMITER_URL =
  process.env.NEXT_PUBLIC_RATE_LIMITER_URL ?? "http://localhost:8082";

const EMPTY_STATE: RateLimitEvent = {
  type: "CONFIG",
  algorithm: "TOKEN_BUCKET",
  level: 0,
  capacity: 10,
  ratePerSecond: 2,
  windowSeconds: 10,
  windowRemainingMs: 0,
  recentOffsetsMs: [],
  timestamp: new Date().toISOString(),
};

export default function RateLimiterPage() {
  const [events, setEvents] = useState<RateLimitEvent[]>([]);
  const [latest, setLatest] = useState<RateLimitEvent>(EMPTY_STATE);
  const [bursting, setBursting] = useState(false);

  const handleEvent = useCallback((event: RateLimitEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 50));
    setLatest(event);
  }, []);

  const { connected } = useRateLimitEvents(handleEvent);

  useEffect(() => {
    fetch(`${RATE_LIMITER_URL}/ratelimit/state`)
      .then((r) => r.json())
      .then((s) =>
        setLatest((prev) => ({
          ...prev,
          algorithm: s.algorithm,
          level: s.level,
          capacity: s.capacity,
          ratePerSecond: s.ratePerSecond,
          windowSeconds: s.windowSeconds,
          windowRemainingMs: s.windowRemainingMs,
          recentOffsetsMs: s.recentOffsetsMs,
        }))
      )
      .catch(() => {});
  }, []);

  const sendRequest = () => fetch(`${RATE_LIMITER_URL}/ratelimit/request`, { method: "POST" });

  const sendBurst = async () => {
    setBursting(true);
    await Promise.all(Array.from({ length: 20 }).map(() => sendRequest()));
    setBursting(false);
  };

  const switchAlgorithm = (algorithm: RateLimitAlgorithm) => {
    setEvents([]);
    fetch(`${RATE_LIMITER_URL}/ratelimit/algorithm/${algorithm}`, { method: "POST" })
      .then((r) => r.json())
      .then((s) =>
        setLatest((prev) => ({
          ...prev,
          algorithm: s.algorithm,
          level: s.level,
          capacity: s.capacity,
          ratePerSecond: s.ratePerSecond,
          windowSeconds: s.windowSeconds,
          windowRemainingMs: s.windowRemainingMs,
          recentOffsetsMs: s.recentOffsetsMs,
        }))
      );
  };

  const configDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateConfig = (capacity: number, ratePerSecond: number, windowSeconds: number) => {
    setLatest((prev) => ({ ...prev, capacity, ratePerSecond, windowSeconds }));
    if (configDebounce.current) clearTimeout(configDebounce.current);
    configDebounce.current = setTimeout(() => {
      fetch(
        `${RATE_LIMITER_URL}/ratelimit/config?capacity=${capacity}&ratePerSecond=${ratePerSecond}&windowSeconds=${windowSeconds}`,
        { method: "POST" }
      );
    }, 250);
  };

  const accepted = events.filter((e) => e.type === "ACCEPTED").length;
  const rejected = events.filter((e) => e.type === "REJECTED").length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">
            ← Redis Cache Lab
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                🪣 Rate Limiter Lab
              </h1>
              <p className="text-slate-400 text-sm mt-1">Four algorithms, four different ways to say "slow down."</p>
              <Link href="/load-balancer" className="text-xs text-cyan-500 hover:text-cyan-300">
                Load Balancer Lab →
              </Link>
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
              <AuthButton />
            </div>
          </div>
        </motion.div>

        <AlgorithmTabs active={latest.algorithm} onChange={switchAlgorithm} />

        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendRequest}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-sm font-bold shadow-lg"
          >
            📨 Send request
          </motion.button>
          <motion.button
            whileHover={{ scale: bursting ? 1 : 1.05 }}
            whileTap={{ scale: bursting ? 1 : 0.95 }}
            disabled={bursting}
            onClick={sendBurst}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-sm font-bold shadow-lg disabled:opacity-50"
          >
            {bursting ? "⏳ Bursting…" : "💥 Burst 20 requests"}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={latest.algorithm}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {latest.algorithm === "TOKEN_BUCKET" && <TokenBucketViz level={latest.level} capacity={latest.capacity} />}
            {latest.algorithm === "LEAKY_BUCKET" && <LeakyBucketViz level={latest.level} capacity={latest.capacity} />}
            {latest.algorithm === "FIXED_WINDOW" && (
              <FixedWindowViz
                level={latest.level}
                capacity={latest.capacity}
                windowSeconds={latest.windowSeconds}
                windowRemainingMs={latest.windowRemainingMs}
              />
            )}
            {latest.algorithm === "SLIDING_WINDOW" && (
              <SlidingWindowViz
                level={latest.level}
                capacity={latest.capacity}
                windowSeconds={latest.windowSeconds}
                recentOffsetsMs={latest.recentOffsetsMs}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <RateLimiterControls
          algorithm={latest.algorithm}
          capacity={latest.capacity}
          ratePerSecond={latest.ratePerSecond}
          windowSeconds={latest.windowSeconds}
          onCapacityChange={(v) => updateConfig(v, latest.ratePerSecond, latest.windowSeconds)}
          onRateChange={(v) => updateConfig(latest.capacity, v, latest.windowSeconds)}
          onWindowChange={(v) => updateConfig(latest.capacity, latest.ratePerSecond, v)}
        />

        <AcceptRejectChart events={events} />

        <div className="text-xs text-slate-500 text-center">
          {accepted + rejected > 0 &&
            `${Math.round((accepted / (accepted + rejected)) * 100)}% of requests in this session were accepted`}
        </div>
      </div>
    </main>
  );
}
