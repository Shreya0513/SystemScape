"use client";

import { useSocketTopic } from "./useSocketTopic";
import type { EvictionEvent } from "./types";

const REDIS_LAB_URL =
  process.env.NEXT_PUBLIC_REDIS_LAB_URL ?? "http://localhost:8081";

export function useEvictionEvents(onEvent: (event: EvictionEvent) => void) {
  return useSocketTopic<EvictionEvent>(REDIS_LAB_URL, "/topic/eviction-events", onEvent);
}
