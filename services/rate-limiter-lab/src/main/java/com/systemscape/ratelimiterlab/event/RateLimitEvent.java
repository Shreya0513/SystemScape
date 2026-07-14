package com.systemscape.ratelimiterlab.event;

import com.systemscape.ratelimiterlab.limiter.RateLimitState;

import java.time.Instant;
import java.util.List;

public record RateLimitEvent(
        String type,
        String algorithm,
        double level,
        int capacity,
        double ratePerSecond,
        int windowSeconds,
        long windowRemainingMs,
        List<Long> recentOffsetsMs,
        Instant timestamp
) {
    public static RateLimitEvent of(String type, String algorithm, RateLimitState s) {
        return new RateLimitEvent(
                type, algorithm, s.level(), s.capacity(), s.ratePerSecond(),
                s.windowSeconds(), s.windowRemainingMs(), s.recentOffsetsMs(), Instant.now()
        );
    }
}
