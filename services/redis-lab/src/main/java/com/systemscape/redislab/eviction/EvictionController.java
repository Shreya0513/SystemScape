package com.systemscape.redislab.eviction;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/eviction")
@CrossOrigin(origins = "*")
public class EvictionController {

    private static final int CAPACITY = 4;

    private final BoundedCache cache = new BoundedCache(CAPACITY, BoundedCache.Policy.LRU);
    private final SimpMessagingTemplate messagingTemplate;

    public EvictionController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/access/{key}")
    public Map<String, Object> accessKey(@PathVariable String key) {
        BoundedCache.AccessResult result = cache.access(key, "value:" + key);

        broadcast(EvictionEvent.of(
                result.hit() ? "ACCESS_HIT" : "ACCESS_MISS",
                key,
                result.evictedKey(),
                result.slots(),
                cache.getPolicy().name()
        ));

        if (result.evictedKey() != null) {
            broadcast(EvictionEvent.of("EVICT", result.evictedKey(), result.evictedKey(), result.slots(), cache.getPolicy().name()));
        }

        return Map.of(
                "hit", result.hit(),
                "evictedKey", result.evictedKey() == null ? "" : result.evictedKey(),
                "slots", result.slots(),
                "policy", cache.getPolicy().name()
        );
    }

    @PostMapping("/policy/{policy}")
    public Map<String, Object> setPolicy(@PathVariable String policy) {
        cache.setPolicy(BoundedCache.Policy.valueOf(policy.toUpperCase()));
        broadcast(EvictionEvent.of("RESET", null, null, cache.slots(), cache.getPolicy().name()));
        return state();
    }

    @DeleteMapping
    public Map<String, Object> reset() {
        cache.reset();
        broadcast(EvictionEvent.of("RESET", null, null, cache.slots(), cache.getPolicy().name()));
        return state();
    }

    @GetMapping
    public Map<String, Object> state() {
        return Map.of(
                "slots", cache.slots(),
                "policy", cache.getPolicy().name(),
                "capacity", CAPACITY
        );
    }

    private void broadcast(EvictionEvent event) {
        messagingTemplate.convertAndSend("/topic/eviction-events", event);
    }
}
