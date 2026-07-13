"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Edge,
  MarkerType,
  Node,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import type { CacheEvent } from "@/lib/types";

const NODE_IDS = ["client", "redis", "database"] as const;

const baseNodes: Node[] = [
  {
    id: "client",
    position: { x: 0, y: 100 },
    data: { label: "Client" },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: "redis",
    position: { x: 300, y: 0 },
    data: { label: "Redis" },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: "database",
    position: { x: 600, y: 100 },
    data: { label: "Database" },
    sourcePosition: Position.Left,
    targetPosition: Position.Right,
  },
];

const baseEdges: Edge[] = [
  { id: "client-redis", source: "client", target: "redis", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "redis-database", source: "redis", target: "database", markerEnd: { type: MarkerType.ArrowClosed } },
];

function activeEdgeIds(eventType: CacheEvent["type"]): string[] {
  switch (eventType) {
    case "REQUEST":
      return ["client-redis"];
    case "CACHE_MISS":
      return ["redis-database"];
    case "DB_HIT":
    case "DB_MISS":
    case "CACHE_STORE":
      return ["redis-database"];
    case "CACHE_HIT":
    case "RESPONSE":
      return ["client-redis"];
    default:
      return [];
  }
}

export function CacheGraph({ lastEvent }: { lastEvent: CacheEvent | null }) {
  const active = useMemo(
    () => (lastEvent ? activeEdgeIds(lastEvent.type) : []),
    [lastEvent]
  );

  const edges = useMemo(
    () =>
      baseEdges.map((edge) => ({
        ...edge,
        animated: active.includes(edge.id),
        style: active.includes(edge.id)
          ? { stroke: "#22d3ee", strokeWidth: 2 }
          : { stroke: "#334155" },
      })),
    [active]
  );

  const nodes = useMemo(
    () =>
      baseNodes.map((node) => ({
        ...node,
        style: {
          background: "#111827",
          color: "#e6edf3",
          border:
            lastEvent && highlightNode(lastEvent.type) === node.id
              ? "2px solid #22d3ee"
              : "1px solid #334155",
          borderRadius: 8,
          padding: 10,
        },
      })),
    [lastEvent]
  );

  return (
    <div style={{ height: 320 }} className="rounded-lg bg-slate-950">
      <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
        <Background color="#1e293b" gap={16} />
      </ReactFlow>
    </div>
  );
}

function highlightNode(eventType: CacheEvent["type"]): (typeof NODE_IDS)[number] | null {
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
