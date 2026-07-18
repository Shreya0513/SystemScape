package com.systemscape.loadbalancerlab.event;

import java.time.Instant;
import java.util.List;

public record RouteEvent(
        String type,
        String serverId,
        String algorithm,
        String clientKey,
        List<ServerSnapshot> servers,
        Instant timestamp
) {
    public static RouteEvent of(String type, String serverId, String algorithm, String clientKey, List<ServerSnapshot> servers) {
        return new RouteEvent(type, serverId, algorithm, clientKey, servers, Instant.now());
    }

    public record ServerSnapshot(
            String id,
            int weight,
            boolean alive,
            int latencyMs,
            int cpuLoadPct,
            int activeConnections,
            int totalRequests
    ) {}
}
