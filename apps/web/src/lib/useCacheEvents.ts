"use client";

import { useSocketTopic } from "./useSocketTopic";
import type { CacheEvent } from "./types";

const REDIS_LAB_URL =
  process.env.NEXT_PUBLIC_REDIS_LAB_URL ?? "http://localhost:8081";

export function useCacheEvents(onEvent: (event: CacheEvent) => void) {
  return useSocketTopic<CacheEvent>(REDIS_LAB_URL, "/topic/cache-events", onEvent);
}
