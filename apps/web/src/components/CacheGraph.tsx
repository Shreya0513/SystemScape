"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Edge,
  MarkerType,
  Node,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import type { CacheEvent } from "@/lib/types";

type NodeId = "client" | "redis" | "database";

const NODE_META: Record<NodeId, { label: string; emoji: string; glow: string }> = {
  client: { label: "Client", emoji: "🧑‍💻", glow: "#3987e5" },
  redis: { label: "Redis", emoji: "⚡", glow: "#eda100" },
  database: { label: "Database", emoji: "🗄️", glow: "#1baf7a" },
};

function EmojiNode({ id, active }: { id: NodeId; active: boolean }) {
  const meta = NODE_META[id];
  return (
    <motion.div
      animate={
        active
          ? { scale: [1, 1.18, 1], boxShadow: [`0 0 0px ${meta.glow}`, `0 0 24px ${meta.glow}`, `0 0 0px ${meta.glow}`] }
          : { scale: 1, boxShadow: `0 0 0px ${meta.glow}` }
      }
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center rounded-2xl border-2 px-5 py-3 bg-slate-900"
      style={{ borderColor: active ? meta.glow : "#334155" }}
    >
      <span className="text-2xl leading-none">{meta.emoji}</span>
      <span className="text-xs font-bold mt-1 tracking-wide" style={{ color: active ? meta.glow : "#cbd5e1" }}>
        {meta.label}
      </span>
    </motion.div>
  );
}

const baseNodes: Node[] = [
  { id: "client", position: { x: 0, y: 110 }, data: {}, sourcePosition: Position.Right, targetPosition: Position.Left },
  { id: "redis", position: { x: 320, y: 0 }, data: {}, sourcePosition: Position.Right, targetPosition: Position.Left },
  { id: "database", position: { x: 640, y: 110 }, data: {}, sourcePosition: Position.Left, targetPosition: Position.Right },
];

const baseEdges: Edge[] = [
  { id: "client-redis", source: "client", target: "redis", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "redis-database", source: "redis", target: "database", markerEnd: { type: MarkerType.ArrowClosed } },
];

function activeEdgeIds(eventType: CacheEvent["type"]): string[] {
  switch (eventType) {
    case "REQUEST":
    case "CACHE_HIT":
    case "RESPONSE":
      return ["client-redis"];
    case "CACHE_MISS":
    case "DB_HIT":
    case "DB_MISS":
    case "CACHE_STORE":
      return ["redis-database"];
    default:
      return [];
  }
}

function highlightNode(eventType: CacheEvent["type"]): NodeId | null {
  switch (eventType) {
    case "REQUEST":
    case "RESPONSE":
      return "client";
    case "CACHE_HIT":
    case "CACHE_MISS":
    case "CACHE_STORE":
      return "redis";
    case "DB_HIT":
    case "DB_MISS":
      return "database";
    default:
      return null;
  }
}

export function CacheGraph({ lastEvent }: { lastEvent: CacheEvent | null }) {
  const active = useMemo(() => (lastEvent ? activeEdgeIds(lastEvent.type) : []), [lastEvent]);
  const activeNode = lastEvent ? highlightNode(lastEvent.type) : null;

  const edgeColor = active.includes("redis-database") ? "#eda100" : "#3987e5";

  const edges = useMemo(
    () =>
      baseEdges.map((edge) => ({
        ...edge,
        animated: active.includes(edge.id),
        style: active.includes(edge.id)
          ? { stroke: edgeColor, strokeWidth: 3 }
          : { stroke: "#334155", strokeWidth: 2 },
      })),
    [active, edgeColor]
  );

  const nodes = useMemo(
    () =>
      baseNodes.map((node) => ({
        ...node,
        data: {
          label: (
            <EmojiNode id={node.id as NodeId} active={activeNode === node.id} />
          ),
        },
        style: { background: "transparent", border: "none", padding: 0 },
      })),
    [activeNode]
  );

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 overflow-hidden" style={{ height: 320 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }} nodesDraggable={false} zoomOnScroll={false}>
        <Background color="#1e293b" gap={18} />
      </ReactFlow>

      <AnimatePresence>
        {lastEvent && (
          <motion.div
            key={lastEvent.timestamp + lastEvent.type}
            initial={{ opacity: 0, y: -8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold shadow-lg"
            style={{
              background: eventBadgeColor(lastEvent.type),
              color: "#0b0b0b",
            }}
          >
            {eventBadgeLabel(lastEvent.type)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function eventBadgeColor(type: CacheEvent["type"]): string {
  switch (type) {
    case "CACHE_HIT":
      return "#0ca30c";
    case "CACHE_MISS":
      return "#fab219";
    case "DB_MISS":
      return "#d03b3b";
    case "CACHE_STORE":
      return "#1baf7a";
    default:
      return "#3987e5";
  }
}

function eventBadgeLabel(type: CacheEvent["type"]): string {
  switch (type) {
    case "REQUEST":
      return "🚀 Request sent";
    case "CACHE_HIT":
      return "🎯 Cache hit!";
    case "CACHE_MISS":
      return "💨 Cache miss";
    case "DB_HIT":
      return "🗄️ Found in DB";
    case "DB_MISS":
      return "❌ Not found";
    case "CACHE_STORE":
      return "💾 Stored in cache";
    case "RESPONSE":
      return "✅ Response delivered";
    case "EVICT":
      return "🗑️ Evicted";
    default:
      return type;
  }
}
