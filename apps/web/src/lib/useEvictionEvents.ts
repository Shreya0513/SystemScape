"use client";

import { useSocketTopic } from "./useSocketTopic";
import type { EvictionEvent } from "./types";

export function useEvictionEvents(onEvent: (event: EvictionEvent) => void) {
  return useSocketTopic<EvictionEvent>("/topic/eviction-events", onEvent);
}
