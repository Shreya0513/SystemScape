package com.systemscape.ratelimiterlab.limiter;

import java.util.List;

/** Requests fill a queue of size capacity; the queue drains continuously at ratePerSecond. */
public class LeakyBucketLimiter implements RateLimiterAlgorithm {

    private int capacity;
    private double ratePerSecond;
    private double queueLevel;
    private long lastLeakNanos;

    public LeakyBucketLimiter(int capacity, double ratePerSecond) {
        reconfigure(capacity, ratePerSecond, 0);
    }

    @Override
    public synchronized boolean tryConsume() {
        leak();
        if (queueLevel + 1.0 <= capacity) {
            queueLevel += 1.0;
            return true;
        }
        return false;
    }

    @Override
    public synchronized RateLimitState state() {
        leak();
        return new RateLimitState(queueLevel, capacity, ratePerSecond, 0, 0, List.of());
    }

    @Override
    public synchronized void reconfigure(int capacity, double ratePerSecond, int windowSeconds) {
        this.capacity = capacity;
        this.ratePerSecond = ratePerSecond;
        this.queueLevel = 0;
        this.lastLeakNanos = System.nanoTime();
    }

    private void leak() {
        long now = System.nanoTime();
        double elapsedSeconds = (now - lastLeakNanos) / 1_000_000_000.0;
        queueLevel = Math.max(0, queueLevel - elapsedSeconds * ratePerSecond);
        lastLeakNanos = now;
    }
}
