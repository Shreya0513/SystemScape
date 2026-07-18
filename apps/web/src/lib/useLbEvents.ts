"use client";

import { useSocketTopic } from "./useSocketTopic";
import type { LbEvent } from "./types";

const LOAD_BALANCER_URL =
  process.env.NEXT_PUBLIC_LOAD_BALANCER_URL ?? "http://localhost:8083";

export function useLbEvents(onEvent: (event: LbEvent) => void) {
  return useSocketTopic<LbEvent>(LOAD_BALANCER_URL, "/topic/lb-events", onEvent);
}
