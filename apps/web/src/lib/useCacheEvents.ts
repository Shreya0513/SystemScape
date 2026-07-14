"use client";

import { useSocketTopic } from "./useSocketTopic";
import type { CacheEvent } from "./types";

export function useCacheEvents(onEvent: (event: CacheEvent) => void) {
  return useSocketTopic<CacheEvent>("/topic/cache-events", onEvent);
}
