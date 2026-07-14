package com.systemscape.ratelimiterlab.limiter;

public interface RateLimiterAlgorithm {
    boolean tryConsume();
    RateLimitState state();
    void reconfigure(int capacity, double ratePerSecond, int windowSeconds);
}
