"use client";

import { useSocketTopic } from "./useSocketTopic";
import type { RateLimitEvent } from "./types";

const RATE_LIMITER_URL =
  process.env.NEXT_PUBLIC_RATE_LIMITER_URL ?? "http://localhost:8082";

export function useRateLimitEvents(onEvent: (event: RateLimitEvent) => void) {
  return useSocketTopic<RateLimitEvent>(RATE_LIMITER_URL, "/topic/ratelimit-events", onEvent);
}
