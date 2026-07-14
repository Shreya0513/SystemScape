package com.systemscape.ratelimiterlab.limiter;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

/** Sliding window log: keeps exact timestamps of accepted requests in the trailing windowSeconds. */
public class SlidingWindowLimiter implements RateLimiterAlgorithm {

    private int capacity;
    private int windowSeconds;
    private final Deque<Long> timestamps = new ArrayDeque<>();

    public SlidingWindowLimiter(int capacity, int windowSeconds) {
        reconfigure(capacity, 0, windowSeconds);
    }

    @Override
    public synchronized boolean tryConsume() {
        long now = System.currentTimeMillis();
        purge(now);
        if (timestamps.size() < capacity) {
            timestamps.addLast(now);
            return true;
        }
        return false;
    }

    @Override
    public synchronized RateLimitState state() {
        long now = System.currentTimeMillis();
        purge(now);
        List<Long> offsets = new ArrayList<>();
        for (Long ts : timestamps) {
            offsets.add(now - ts);
        }
        return new RateLimitState(timestamps.size(), capacity, 0, windowSeconds, 0, offsets);
    }

    @Override
    public synchronized void reconfigure(int capacity, double ratePerSecond, int windowSeconds) {
        this.capacity = capacity;
        this.windowSeconds = windowSeconds;
        this.timestamps.clear();
    }

    private void purge(long now) {
        long cutoff = now - windowSeconds * 1000L;
        while (!timestamps.isEmpty() && timestamps.peekFirst() < cutoff) {
            timestamps.pollFirst();
        }
    }
}
