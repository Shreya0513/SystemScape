package com.systemscape.loadbalancerlab.controller;

import com.systemscape.loadbalancerlab.balancer.LoadBalancer;
import com.systemscape.loadbalancerlab.balancer.Server;
import com.systemscape.loadbalancerlab.event.RouteEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/lb")
@CrossOrigin(origins = "*")
public class LoadBalancerController {

    private final LoadBalancer loadBalancer = new LoadBalancer();
    private final SimpMessagingTemplate messagingTemplate;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);

    public LoadBalancerController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/request")
    public Map<String, Object> request(@RequestParam(defaultValue = "client-1") String clientIp) {
        Optional<Server> chosen = loadBalancer.select(clientIp);

        if (chosen.isEmpty()) {
            broadcast("NO_SERVERS", null, clientIp);
            return Map.of("routed", false);
        }

        Server server = chosen.get();
        server.incrementConnections();
        server.incrementTotalRequests();
        broadcast("ROUTE", server.getId(), clientIp);

        scheduler.schedule(() -> {
            server.decrementConnections();
            broadcast("COMPLETE", server.getId(), clientIp);
        }, server.getLatencyMs(), TimeUnit.MILLISECONDS);

        return Map.of("routed", true, "serverId", server.getId());
    }

    @GetMapping("/servers")
    public Map<String, Object> servers() {
        return Map.of("algorithm", loadBalancer.getAlgorithm().name(), "servers", snapshots());
    }

    @PostMapping("/servers")
    public Map<String, Object> addServer(@RequestParam(defaultValue = "1") int weight) {
        Server server = loadBalancer.addServer(weight);
        broadcast("ADD", server.getId(), null);
        return servers();
    }

    @DeleteMapping("/servers/{id}")
    public Map<String, Object> removeServer(@PathVariable String id) {
        loadBalancer.removeServer(id);
        broadcast("REMOVE", id, null);
        return servers();
    }

    @PostMapping("/servers/{id}/kill")
    public Map<String, Object> kill(@PathVariable String id) {
        loadBalancer.findServer(id).ifPresent(s -> s.setAlive(false));
        broadcast("KILL", id, null);
        return servers();
    }

    @PostMapping("/servers/{id}/revive")
    public Map<String, Object> revive(@PathVariable String id) {
        loadBalancer.findServer(id).ifPresent(s -> s.setAlive(true));
        broadcast("REVIVE", id, null);
        return servers();
    }

    @PostMapping("/servers/{id}/weight")
    public Map<String, Object> setWeight(@PathVariable String id, @RequestParam int value) {
        loadBalancer.findServer(id).ifPresent(s -> s.setWeight(value));
        broadcast("CONFIG", id, null);
        return servers();
    }

    @PostMapping("/servers/{id}/latency")
    public Map<String, Object> setLatency(@PathVariable String id, @RequestParam int ms) {
        loadBalancer.findServer(id).ifPresent(s -> s.setLatencyMs(ms));
        broadcast("CONFIG", id, null);
        return servers();
    }

    @PostMapping("/servers/{id}/cpu")
    public Map<String, Object> setCpu(@PathVariable String id, @RequestParam int pct) {
        loadBalancer.findServer(id).ifPresent(s -> s.setCpuLoadPct(pct));
        broadcast("CONFIG", id, null);
        return servers();
    }

    @PostMapping("/algorithm/{name}")
    public Map<String, Object> setAlgorithm(@PathVariable String name) {
        loadBalancer.setAlgorithm(LoadBalancer.Algorithm.valueOf(name.toUpperCase()));
        broadcast("CONFIG", null, null);
        return servers();
    }

    private List<RouteEvent.ServerSnapshot> snapshots() {
        return loadBalancer.servers().stream()
                .map(s -> new RouteEvent.ServerSnapshot(
                        s.getId(), s.getWeight(), s.isAlive(), s.getLatencyMs(),
                        s.getCpuLoadPct(), s.getActiveConnections(), s.getTotalRequests()
                ))
                .toList();
    }

    private void broadcast(String type, String serverId, String clientKey) {
        messagingTemplate.convertAndSend(
                "/topic/lb-events",
                RouteEvent.of(type, serverId, loadBalancer.getAlgorithm().name(), clientKey, snapshots())
        );
    }
}
