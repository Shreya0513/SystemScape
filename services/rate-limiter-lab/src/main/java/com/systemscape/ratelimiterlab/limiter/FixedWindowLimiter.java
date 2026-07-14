package com.systemscape.ratelimiterlab.limiter;

import java.util.List;

/** Counts requests in a fixed wall-clock window; resets to 0 the instant the window elapses. */
public class FixedWindowLimiter implements RateLimiterAlgorithm {

    private int capacity;
    private int windowSeconds;
    private int count;
    private long windowStartMillis;

    public FixedWindowLimiter(int capacity, int windowSeconds) {
        reconfigure(capacity, 0, windowSeconds);
    }

    @Override
    public synchronized boolean tryConsume() {
        rollWindowIfExpired();
        if (count < capacity) {
            count++;
            return true;
        }
        return false;
    }

    @Override
    public synchronized RateLimitState state() {
        rollWindowIfExpired();
        long windowRemainingMs = Math.max(0, (windowStartMillis + windowSeconds * 1000L) - System.currentTimeMillis());
        return new RateLimitState(count, capacity, 0, windowSeconds, windowRemainingMs, List.of());
    }

    @Override
    public synchronized void reconfigure(int capacity, double ratePerSecond, int windowSeconds) {
        this.capacity = capacity;
        this.windowSeconds = windowSeconds;
        this.count = 0;
        this.windowStartMillis = System.currentTimeMillis();
    }

    private void rollWindowIfExpired() {
        long now = System.currentTimeMillis();
        if (now - windowStartMillis >= windowSeconds * 1000L) {
            windowStartMillis = now;
            count = 0;
        }
    }
}
