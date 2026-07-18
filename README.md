# SystemScape

Interactive platform for learning distributed systems through live, animated simulations.

## Status

V1 in progress — three labs are live and fully containerized.

- `services/redis-lab` (port 8081) — Redis-backed cache demo (TTL, manual eviction, hit ratio,
  latency), an in-process LRU/LFU eviction playground, and four failure/optimization demos
  (warming, penetration, avalanche, stampede). Broadcasts events over STOMP/WebSocket.
- `services/rate-limiter-lab` (port 8082) — four switchable rate-limiting algorithms: Token
  Bucket, Leaky Bucket, Fixed Window, Sliding Window (exact log).
- `services/load-balancer-lab` (port 8083) — five switchable routing algorithms: Round Robin,
  Least Connections, Weighted Round Robin (smooth WRR), IP Hash, Random. Live server pool with
  kill/revive/weight/latency controls.
- `apps/api-gateway` (port 8090) — placeholder gateway (health check only); will become the
  real entry point (auth, rate limiting) once there's enough surface area to justify it.
- `apps/web` (port 3000) — Next.js + TypeScript + Tailwind + React Flow + Framer Motion.
  Each lab has its own animated, gamified visualization, connected live over WebSocket.
  GitHub OAuth login via NextAuth.js (session-only for now — no lab endpoints are protected
  yet, since there's nothing user-specific to gate until Projects/Bookmarks/History exist).

## Structure

```
systemscape/
├── apps/
│   ├── web/                   # Next.js frontend
│   ├── api-gateway/           # Spring Boot gateway
├── services/
│   ├── redis-lab/             # Redis Cache Lab
│   ├── rate-limiter-lab/      # Rate Limiter Lab
│   └── load-balancer-lab/     # Load Balancer Lab
├── packages/
│   └── shared-types/          # (reserved for shared TS types across labs)
├── docker/
│   └── docker-compose.yml
└── docs/
```

## Set up GitHub login (one-time, optional)

Sign-in works without this — it just shows "Sign in with GitHub" and fails on click until
configured. To make it work:

1. Go to https://github.com/settings/developers → **New OAuth App**.
2. Homepage URL: `http://localhost:3000`. Authorization callback URL:
   `http://localhost:3000/api/auth/callback/github`.
3. Copy the generated Client ID and Client Secret.
4. Generate a session secret: `openssl rand -base64 32`.
5. Put all three into `apps/web/.env.local` (copy from `.env.local.example`) if running the
   frontend with `npm run dev`, **or** into `docker/.env` (copy from `docker/.env.example`) if
   running via Docker Compose.

## Running locally

### Docker Compose (the whole stack, one command)

```bash
cd docker
cp .env.example .env   # fill in GitHub OAuth values if you want login to work
docker compose up --build
```

This builds and starts all 7 containers: redis, postgres, redis-lab, rate-limiter-lab,
load-balancer-lab, api-gateway, and the web frontend. Open http://localhost:3000.

### Frontend-only dev loop (hot reload, backends still via Docker)

```bash
cd docker
docker compose up --build redis redis-lab rate-limiter-lab load-balancer-lab

cd apps/web
cp .env.local.example .env.local   # fill in GitHub OAuth values if you want login to work
npm install
npm run dev
```

## Try it

1. Open http://localhost:3000 — **Redis Cache Lab**. Click `GET /users/1`, watch the
   hit/miss animation, try the TTL slider, the LRU/LFU playground, and the four failure demos.
2. Click through to **Rate Limiter Lab** — switch between the four algorithm tabs, send a
   burst of requests, and watch each one visualize differently (filling bucket, draining
   pipe, window grid, sliding timeline).
3. Click through to **Load Balancer Lab** — switch algorithms, kill a server mid-traffic,
   adjust weights, and watch the request distribution chart update live.

## Next steps

- Google + email login (GitHub is wired; same NextAuth setup, just add providers).
- Persisted user data (Projects/Bookmarks/History) now that there's a session to attach it
  to — needs a Postgres users table and is the actual reason to add JWT validation in
  `api-gateway`.
- Wire `api-gateway` as the real entry point once the frontend has a reason to route through it.
- Add `packages/shared-types` for event contracts instead of duplicating them in Java and
  TypeScript per service.
- Kafka Lab, Message Queue Lab, Circuit Breaker, Distributed Lock (V2 per the roadmap).
