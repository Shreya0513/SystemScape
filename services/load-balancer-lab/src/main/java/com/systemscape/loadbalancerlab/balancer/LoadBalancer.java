package com.systemscape.loadbalancerlab.balancer;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

public class LoadBalancer {

    public enum Algorithm { ROUND_ROBIN, LEAST_CONNECTIONS, WEIGHTED_ROUND_ROBIN, IP_HASH, RANDOM }

    private final List<Server> servers = new CopyOnWriteArrayList<>();
    private final AtomicInteger roundRobinCursor = new AtomicInteger(0);
    private final AtomicInteger serverCounter = new AtomicInteger(0);
    private volatile Algorithm algorithm = Algorithm.ROUND_ROBIN;

    public LoadBalancer() {
        addServer(1);
        addServer(1);
        addServer(1);
    }

    public synchronized Server addServer(int weight) {
        Server server = new Server("server-" + serverCounter.incrementAndGet(), weight);
        servers.add(server);
        return server;
    }

    public synchronized void removeServer(String id) {
        servers.removeIf(s -> s.getId().equals(id));
    }

    public List<Server> servers() {
        return List.copyOf(servers);
    }

    public Optional<Server> findServer(String id) {
        return servers.stream().filter(s -> s.getId().equals(id)).findFirst();
    }

    public Algorithm getAlgorithm() { return algorithm; }

    public synchronized void setAlgorithm(Algorithm algorithm) {
        this.algorithm = algorithm;
        roundRobinCursor.set(0);
        for (Server s : servers) s.currentWeight = 0;
    }

    public synchronized Optional<Server> select(String clientKey) {
        List<Server> alive = servers.stream().filter(Server::isAlive).collect(Collectors.toList());
        if (alive.isEmpty()) return Optional.empty();

        return switch (algorithm) {
            case ROUND_ROBIN -> Optional.of(alive.get(Math.floorMod(roundRobinCursor.getAndIncrement(), alive.size())));
            case RANDOM -> Optional.of(alive.get(ThreadLocalRandom.current().nextInt(alive.size())));
            case LEAST_CONNECTIONS -> alive.stream().min((a, b) -> a.getActiveConnections() - b.getActiveConnections());
            case IP_HASH -> Optional.of(alive.get(Math.floorMod(clientKey.hashCode(), alive.size())));
            case WEIGHTED_ROUND_ROBIN -> selectWeightedRoundRobin(alive);
        };
    }

    /** Classic smooth weighted round robin (as used by nginx): each pick, the server with the
     *  highest current weight wins, then its weight is reduced by the total, giving a smooth
     *  distribution proportional to weight instead of clumping. */
    private Optional<Server> selectWeightedRoundRobin(List<Server> alive) {
        int totalWeight = alive.stream().mapToInt(Server::getWeight).sum();
        if (totalWeight <= 0) return Optional.of(alive.get(0));

        Server best = null;
        for (Server s : alive) {
            s.currentWeight += s.getWeight();
            if (best == null || s.currentWeight > best.currentWeight) {
                best = s;
            }
        }
        best.currentWeight -= totalWeight;
        return Optional.of(best);
    }
}
