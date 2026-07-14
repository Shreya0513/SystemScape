package com.systemscape.ratelimiterlab.limiter;

import java.util.List;

/** Tokens refill continuously at ratePerSecond, capped at capacity. A request needs one token. */
public class TokenBucketLimiter implements RateLimiterAlgorithm {

    private int capacity;
    private double ratePerSecond;
    private double tokens;
    private long lastRefillNanos;

    public TokenBucketLimiter(int capacity, double ratePerSecond) {
        reconfigure(capacity, ratePerSecond, 0);
    }

    @Override
    public synchronized boolean tryConsume() {
        refill();
        if (tokens >= 1.0) {
            tokens -= 1.0;
            return true;
        }
        return false;
    }

    @Override
    public synchronized RateLimitState state() {
        refill();
        return new RateLimitState(tokens, capacity, ratePerSecond, 0, 0, List.of());
    }

    @Override
    public synchronized void reconfigure(int capacity, double ratePerSecond, int windowSeconds) {
        this.capacity = capacity;
        this.ratePerSecond = ratePerSecond;
        this.tokens = capacity;
        this.lastRefillNanos = System.nanoTime();
    }

    private void refill() {
        long now = System.nanoTime();
        double elapsedSeconds = (now - lastRefillNanos) / 1_000_000_000.0;
        tokens = Math.min(capacity, tokens + elapsedSeconds * ratePerSecond);
        lastRefillNanos = now;
    }
}
