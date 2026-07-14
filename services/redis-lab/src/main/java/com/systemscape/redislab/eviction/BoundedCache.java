package com.systemscape.redislab.eviction;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Small in-process cache used purely to make LRU/LFU eviction visible and
 * deterministic for the lab UI. Deliberately not Redis-backed: Redis's own
 * maxmemory-policy eviction is probabilistic (approximated LRU/LFU sampling),
 * which is correct for production but unteachable in a step-by-step demo.
 */
public class BoundedCache {

    public enum Policy { LRU, LFU }

    private final int capacity;
    private final LinkedHashMap<String, String> store;
    private final Map<String, Integer> frequency = new ConcurrentHashMap<>();
    private volatile Policy policy;

    public BoundedCache(int capacity, Policy policy) {
        this.capacity = capacity;
        this.policy = policy;
        this.store = new LinkedHashMap<>(capacity, 0.75f, true);
    }

    public synchronized Policy getPolicy() {
        return policy;
    }

    public synchronized void setPolicy(Policy policy) {
        this.policy = policy;
        store.clear();
        frequency.clear();
    }

    public synchronized void reset() {
        store.clear();
        frequency.clear();
    }

    public synchronized List<String> slots() {
        return List.copyOf(store.keySet());
    }

    public record AccessResult(boolean hit, String evictedKey, List<String> slots) {}

    public synchronized AccessResult access(String key, String value) {
        boolean hit = store.containsKey(key);

        if (hit) {
            store.get(key); // touches LinkedHashMap access order
            frequency.merge(key, 1, Integer::sum);
            return new AccessResult(true, null, slots());
        }

        String evictedKey = null;
        if (store.size() >= capacity) {
            evictedKey = policy == Policy.LFU ? evictLfu() : evictLru();
        }

        store.put(key, value);
        frequency.put(key, 1);
        return new AccessResult(false, evictedKey, slots());
    }

    private String evictLru() {
        String eldest = store.keySet().iterator().next();
        store.remove(eldest);
        frequency.remove(eldest);
        return eldest;
    }

    private String evictLfu() {
        String leastUsed = null;
        int minFreq = Integer.MAX_VALUE;
        for (String key : store.keySet()) {
            int f = frequency.getOrDefault(key, 0);
            if (f < minFreq) {
                minFreq = f;
                leastUsed = key;
            }
        }
        store.remove(leastUsed);
        frequency.remove(leastUsed);
        return leastUsed;
    }
}
