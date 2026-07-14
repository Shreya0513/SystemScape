package com.systemscape.ratelimiterlab.controller;

import com.systemscape.ratelimiterlab.event.RateLimitEvent;
import com.systemscape.ratelimiterlab.limiter.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/ratelimit")
@CrossOrigin(origins = "*")
public class RateLimiterController {

    private final Map<String, RateLimiterAlgorithm> algorithms = new LinkedHashMap<>();
    private volatile String activeAlgorithm = "TOKEN_BUCKET";

    private volatile int capacity = 10;
    private volatile double ratePerSecond = 2.0;
    private volatile int windowSeconds = 10;

    private final SimpMessagingTemplate messagingTemplate;

    public RateLimiterController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
        algorithms.put("TOKEN_BUCKET", new TokenBucketLimiter(capacity, ratePerSecond));
        algorithms.put("LEAKY_BUCKET", new LeakyBucketLimiter(capacity, ratePerSecond));
        algorithms.put("FIXED_WINDOW", new FixedWindowLimiter(capacity, windowSeconds));
        algorithms.put("SLIDING_WINDOW", new SlidingWindowLimiter(capacity, windowSeconds));
    }

    @PostMapping("/request")
    public Map<String, Object> request() {
        RateLimiterAlgorithm active = algorithms.get(activeAlgorithm);
        boolean accepted = active.tryConsume();
        broadcast(accepted ? "ACCEPTED" : "REJECTED");
        return toMap(active.state(), accepted);
    }

    @PostMapping("/algorithm/{name}")
    public Map<String, Object> switchAlgorithm(@PathVariable String name) {
        activeAlgorithm = name.toUpperCase();
        algorithms.get(activeAlgorithm).reconfigure(capacity, ratePerSecond, windowSeconds);
        broadcast("CONFIG");
        return state();
    }

    @PostMapping("/config")
    public Map<String, Object> configure(
            @RequestParam int capacity,
            @RequestParam(defaultValue = "2") double ratePerSecond,
            @RequestParam(defaultValue = "10") int windowSeconds
    ) {
        this.capacity = capacity;
        this.ratePerSecond = ratePerSecond;
        this.windowSeconds = windowSeconds;
        algorithms.get(activeAlgorithm).reconfigure(capacity, ratePerSecond, windowSeconds);
        broadcast("CONFIG");
        return state();
    }

    @GetMapping("/state")
    public Map<String, Object> state() {
        return toMap(algorithms.get(activeAlgorithm).state(), null);
    }

    private Map<String, Object> toMap(RateLimitState s, Boolean accepted) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("algorithm", activeAlgorithm);
        if (accepted != null) map.put("accepted", accepted);
        map.put("level", s.level());
        map.put("capacity", s.capacity());
        map.put("ratePerSecond", s.ratePerSecond());
        map.put("windowSeconds", s.windowSeconds());
        map.put("windowRemainingMs", s.windowRemainingMs());
        map.put("recentOffsetsMs", s.recentOffsetsMs());
        return map;
    }

    private void broadcast(String type) {
        RateLimitState s = algorithms.get(activeAlgorithm).state();
        messagingTemplate.convertAndSend("/topic/ratelimit-events", RateLimitEvent.of(type, activeAlgorithm, s));
    }
}
