export type CacheEventType =
  | "REQUEST"
  | "CACHE_HIT"
  | "CACHE_MISS"
  | "DB_HIT"
  | "DB_MISS"
  | "CACHE_STORE"
  | "RESPONSE"
  | "EVICT";

export interface CacheEvent {
  type: CacheEventType;
  key: string;
  value: string | null;
  latencyMs: number;
  timestamp: string;
}
