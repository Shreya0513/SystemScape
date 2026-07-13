package com.systemscape.redislab.event;

import java.time.Instant;

public record CacheEvent(
        String type,
        String key,
        String value,
        long latencyMs,
        Instant timestamp
) {
    public static CacheEvent of(String type, String key, String value, long latencyMs) {
        return new CacheEvent(type, key, value, latencyMs, Instant.now());
    }
}
