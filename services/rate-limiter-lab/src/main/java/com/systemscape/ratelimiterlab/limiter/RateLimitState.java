package com.systemscape.ratelimiterlab.limiter;

import java.util.List;

/**
 * Generic snapshot shape shared by every algorithm so the controller and
 * frontend don't need algorithm-specific branches. Fields that don't apply
 * to a given algorithm are left at their default (0 / empty list).
 */
public record RateLimitState(
        double level,
        int capacity,
        double ratePerSecond,
        int windowSeconds,
        long windowRemainingMs,
        List<Long> recentOffsetsMs
) {}
