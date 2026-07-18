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

export type EvictionEventType = "ACCESS_HIT" | "ACCESS_MISS" | "EVICT" | "RESET";

export interface EvictionEvent {
  type: EvictionEventType;
  key: string | null;
  evictedKey: string | null;
  slots: string[];
  policy: "LRU" | "LFU";
  timestamp: string;
}

export type RateLimitEventType = "ACCEPTED" | "REJECTED" | "CONFIG";
export type RateLimitAlgorithm = "TOKEN_BUCKET" | "LEAKY_BUCKET" | "FIXED_WINDOW" | "SLIDING_WINDOW";

export interface RateLimitEvent {
  type: RateLimitEventType;
  algorithm: RateLimitAlgorithm;
  level: number;
  capacity: number;
  ratePerSecond: number;
  windowSeconds: number;
  windowRemainingMs: number;
  recentOffsetsMs: number[];
  timestamp: string;
}

export type LbAlgorithm = "ROUND_ROBIN" | "LEAST_CONNECTIONS" | "WEIGHTED_ROUND_ROBIN" | "IP_HASH" | "RANDOM";
export type LbEventType = "ROUTE" | "COMPLETE" | "NO_SERVERS" | "ADD" | "REMOVE" | "KILL" | "REVIVE" | "CONFIG";

export interface ServerSnapshot {
  id: string;
  weight: number;
  alive: boolean;
  latencyMs: number;
  cpuLoadPct: number;
  activeConnections: number;
  totalRequests: number;
}

export interface LbEvent {
  type: LbEventType;
  serverId: string | null;
  algorithm: LbAlgorithm;
  clientKey: string | null;
  servers: ServerSnapshot[];
  timestamp: string;
}
