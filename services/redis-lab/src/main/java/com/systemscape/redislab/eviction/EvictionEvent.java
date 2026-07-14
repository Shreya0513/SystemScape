package com.systemscape.redislab.eviction;

import java.time.Instant;
import java.util.List;

public record EvictionEvent(
        String type,
        String key,
        String evictedKey,
        List<String> slots,
        String policy,
        Instant timestamp
) {
    public static EvictionEvent of(String type, String key, String evictedKey, List<String> slots, String policy) {
        return new EvictionEvent(type, key, evictedKey, slots, policy, Instant.now());
    }
}
