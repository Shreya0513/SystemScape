package com.systemscape.redislab.controller;

import com.systemscape.redislab.event.CacheEvent;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/cache")
@CrossOrigin(origins = "*")
public class CacheController {

    // Stand-in for a real database until Module 1's Postgres-backed lookup is wired up.
    private static final Map<String, String> FAKE_DB = Map.of(
            "1", "{\"id\":1,\"name\":\"Alice\"}",
            "2", "{\"id\":2,\"name\":\"Bob\"}",
            "3", "{\"id\":3,\"name\":\"Carol\"}"
    );

    private final StringRedisTemplate redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    public CacheController(StringRedisTemplate redisTemplate, SimpMessagingTemplate messagingTemplate) {
        this.redisTemplate = redisTemplate;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<String> getUser(@PathVariable String id, @RequestParam(defaultValue = "60") long ttlSeconds) {
        String redisKey = "users:" + id;

        broadcast(CacheEvent.of("REQUEST", redisKey, null, 0));

        long start = System.nanoTime();
        String cached = redisTemplate.opsForValue().get(redisKey);
        long redisLatency = elapsedMs(start);

        if (cached != null) {
            broadcast(CacheEvent.of("CACHE_HIT", redisKey, cached, redisLatency));
            return ResponseEntity.ok(cached);
        }

        broadcast(CacheEvent.of("CACHE_MISS", redisKey, null, redisLatency));

        long dbStart = System.nanoTime();
        simulateDbLatency();
        String value = FAKE_DB.get(id);
        long dbLatency = elapsedMs(dbStart);

        if (value == null) {
            broadcast(CacheEvent.of("DB_MISS", redisKey, null, dbLatency));
            return ResponseEntity.notFound().build();
        }

        broadcast(CacheEvent.of("DB_HIT", redisKey, value, dbLatency));

        redisTemplate.opsForValue().set(redisKey, value, Duration.ofSeconds(ttlSeconds));
        broadcast(CacheEvent.of("CACHE_STORE", redisKey, value, 0));

        broadcast(CacheEvent.of("RESPONSE", redisKey, value, 0));
        return ResponseEntity.ok(value);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> evict(@PathVariable String id) {
        String redisKey = "users:" + id;
        redisTemplate.delete(redisKey);
        broadcast(CacheEvent.of("EVICT", redisKey, null, 0));
        return ResponseEntity.noContent().build();
    }

    private void broadcast(CacheEvent event) {
        messagingTemplate.convertAndSend("/topic/cache-events", event);
    }

    private long elapsedMs(long startNanos) {
        return Duration.ofNanos(System.nanoTime() - startNanos).toMillis();
    }

    private void simulateDbLatency() {
        try {
            Thread.sleep(ThreadLocalRandom.current().nextInt(50, 150));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
