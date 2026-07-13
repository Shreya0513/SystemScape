# SystemScape

Interactive platform for learning distributed systems through live, animated simulations.

## Status

V1 bootstrap: Redis Cache Lab end-to-end vertical slice.

- `services/redis-lab` — Spring Boot service wrapping Redis. Exposes `GET /cache/users/{id}`
  and broadcasts cache lifecycle events (`REQUEST`, `CACHE_HIT`, `CACHE_MISS`, `DB_HIT`,
  `CACHE_STORE`, `RESPONSE`, `EVICT`) over STOMP/WebSocket at `/topic/cache-events`.
- `apps/api-gateway` — Spring Boot gateway placeholder (health check only for now).
- `apps/web` — Next.js + TypeScript + Tailwind + React Flow frontend. Connects directly to
  `redis-lab`'s WebSocket and animates the request → Redis → DB → response path live.

## Structure

```
systemscape/
├── apps/
│   ├── web/                 # Next.js frontend
│   ├── api-gateway/         # Spring Boot gateway
├── services/
│   └── redis-lab/           # Redis Cache Lab
├── packages/
│   └── shared-types/        # (reserved for shared TS types across labs)
├── docker/
│   └── docker-compose.yml
└── docs/
```

## Running locally

### Option A — Docker Compose (redis-lab + api-gateway + redis + postgres)

```bash
cd docker
docker compose up --build
```

Then run the frontend separately (it's not containerized yet):

```bash
cd apps/web
cp .env.local.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

### Option B — Run everything locally without Docker

```bash
# Redis must be running locally on 6379
redis-server &

# Terminal 1
cd services/redis-lab
./mvnw spring-boot:run

# Terminal 2
cd apps/web
cp .env.local.example .env.local
npm install
npm run dev
```

## Try it

1. Open http://localhost:3000
2. Click `GET /users/1` — first click is a cache miss (animates Redis → Database), subsequent
   clicks within the TTL window are cache hits (animates Client → Redis only).
3. Watch the hit ratio update and the event log stream in.

## Next steps

- Add TTL slider, manual eviction button, and hit-ratio/latency charts to the Redis Lab UI.
- Wire `api-gateway` as the real entry point (auth, rate limiting) once more than one lab exists.
- Add `packages/shared-types` for the `CacheEvent` contract instead of duplicating it in
  Java and TypeScript.
- Containerize `apps/web` and add it to `docker-compose.yml`.
