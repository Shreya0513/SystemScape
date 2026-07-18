"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LbAlgorithmTabs } from "@/components/LbAlgorithmTabs";
import { ServerPool } from "@/components/ServerPool";
import { RequestDistributionChart } from "@/components/RequestDistributionChart";
import { AuthButton } from "@/components/AuthButton";
import { useLbEvents } from "@/lib/useLbEvents";
import type { LbAlgorithm, LbEvent, ServerSnapshot } from "@/lib/types";

const LOAD_BALANCER_URL =
  process.env.NEXT_PUBLIC_LOAD_BALANCER_URL ?? "http://localhost:8083";

export default function LoadBalancerPage() {
  const [servers, setServers] = useState<ServerSnapshot[]>([]);
  const [algorithm, setAlgorithmState] = useState<LbAlgorithm>("ROUND_ROBIN");
  const [justRoutedId, setJustRoutedId] = useState<string | null>(null);
  const [bursting, setBursting] = useState(false);

  const refresh = useCallback(() => {
    fetch(`${LOAD_BALANCER_URL}/lb/servers`)
      .then((r) => r.json())
      .then((s) => {
        setServers(s.servers);
        setAlgorithmState(s.algorithm);
      })
      .catch(() => {});
  }, []);

  const handleEvent = useCallback((event: LbEvent) => {
    setServers(event.servers);
    setAlgorithmState(event.algorithm);
    if (event.type === "ROUTE" && event.serverId) {
      setJustRoutedId(event.serverId);
      setTimeout(() => setJustRoutedId(null), 500);
    }
  }, []);

  const { connected } = useLbEvents(handleEvent);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sendRequest = (clientIp?: string) =>
    fetch(`${LOAD_BALANCER_URL}/lb/request${clientIp ? `?clientIp=${clientIp}` : ""}`, { method: "POST" });

  const sendBurst = async () => {
    setBursting(true);
    for (let i = 0; i < 15; i++) {
      await sendRequest(`client-${i % 4}`);
      await new Promise((r) => setTimeout(r, 60));
    }
    setBursting(false);
  };

  const switchAlgorithm = (next: LbAlgorithm) => {
    fetch(`${LOAD_BALANCER_URL}/lb/algorithm/${next}`, { method: "POST" })
      .then((r) => r.json())
      .then((s) => {
        setServers(s.servers);
        setAlgorithmState(s.algorithm);
      });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/rate-limiter" className="text-xs text-slate-500 hover:text-slate-300">
            ← Rate Limiter Lab
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                🌐 Load Balancer Lab
              </h1>
              <p className="text-slate-400 text-sm mt-1">Watch requests get routed across a live server pool.</p>
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

        <LbAlgorithmTabs active={algorithm} onChange={switchAlgorithm} />

        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendRequest()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-sm font-bold shadow-lg"
          >
            📨 Send request
          </motion.button>
          <motion.button
            whileHover={{ scale: bursting ? 1 : 1.05 }}
            whileTap={{ scale: bursting ? 1 : 0.95 }}
            disabled={bursting}
            onClick={sendBurst}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-sm font-bold shadow-lg disabled:opacity-50"
          >
            {bursting ? "⏳ Sending…" : "💥 Send 15 requests (4 clients)"}
          </motion.button>
        </div>

        <ServerPool servers={servers} justRoutedId={justRoutedId} onChanged={refresh} />

        <RequestDistributionChart servers={servers} />

        {algorithm === "IP_HASH" && (
          <p className="text-xs text-slate-500 text-center">
            💡 IP Hash routes by client — the burst button simulates 4 different clients so you can see the same client always land on the same server.
          </p>
        )}
      </div>
    </main>
  );
}
