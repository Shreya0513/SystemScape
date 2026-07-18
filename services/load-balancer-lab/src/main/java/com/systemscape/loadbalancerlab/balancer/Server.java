package com.systemscape.loadbalancerlab.balancer;

import java.util.concurrent.atomic.AtomicInteger;

public class Server {
    private final String id;
    private volatile int weight;
    private volatile boolean alive = true;
    private volatile int latencyMs = 50;
    private volatile int cpuLoadPct = 10;
    private final AtomicInteger activeConnections = new AtomicInteger(0);
    private final AtomicInteger totalRequests = new AtomicInteger(0);

    // Smooth weighted round robin scratch state.
    volatile int currentWeight = 0;

    public Server(String id, int weight) {
        this.id = id;
        this.weight = weight;
    }

    public String getId() { return id; }
    public int getWeight() { return weight; }
    public void setWeight(int weight) { this.weight = weight; }
    public boolean isAlive() { return alive; }
    public void setAlive(boolean alive) { this.alive = alive; }
    public int getLatencyMs() { return latencyMs; }
    public void setLatencyMs(int latencyMs) { this.latencyMs = latencyMs; }
    public int getCpuLoadPct() { return cpuLoadPct; }
    public void setCpuLoadPct(int cpuLoadPct) { this.cpuLoadPct = cpuLoadPct; }
    public int getActiveConnections() { return activeConnections.get(); }
    public void incrementConnections() { activeConnections.incrementAndGet(); }
    public void decrementConnections() { activeConnections.updateAndGet(v -> Math.max(0, v - 1)); }
    public int getTotalRequests() { return totalRequests.get(); }
    public void incrementTotalRequests() { totalRequests.incrementAndGet(); }
}
