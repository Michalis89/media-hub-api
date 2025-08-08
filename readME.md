# Media Hub API

Media Hub API is a NestJS backend for a personal Media Hub covering movies, TV/anime, music, books, and games. The goal is a single API for search, tracking (watched/favorites), ratings, and recommendations.

---

## Current Status

- **Provider:** MyAnimeList (MAL) for anime search & details
- **Redis caching:** Search & by ID, with purge endpoints
- **Healthchecks:** API & Redis
- **Infra:** Postgres + Redis via Docker Compose

---

## Tech Stack

- **NestJS** (TypeScript)
- **PostgreSQL** (Docker)
- **Redis 7** (AOF + password) for caching
- **Axios/HttpModule** for external API calls (MAL)

---

## Quick Start (Local Development)

### 1. Environment

Create a `.env` file in the repo root (do **not** commit it):

```env
PORT=3000
NODE_ENV=development

# Postgres (runs in Docker)
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USER=mediahub
DB_PASS=abcd
DB_NAME=mediahub

# MyAnimeList API
MAL_CLIENT_ID=your-mal-client-id
MAL_CLIENT_SECRET=your-mal-client-secret

# Redis (runs in Docker, with password + AOF)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=change-me-strong
REDIS_TTL_SECONDS=21600
REDIS_URL=redis://:change-me-strong@localhost:6379
```

Make sure `.env` is in `.gitignore`.

---

### 2. Start Infrastructure (Postgres + Redis)

```bash
docker compose up -d
docker compose ps
docker compose exec redis redis-cli -a "$REDIS_PASSWORD" ping # expected: PONG
```

> Redis in `docker-compose.yml` runs with `--appendonly yes` and `--requirepass`.

---

### 3. Start the API

```bash
npm i
npm run start:dev
```

- **Watch mode:** type `rs` to restart

---

### Expected Logs

```
[RedisService] Connected to Redis: PONG
[NestApplication] Nest application successfully started
```

---

## Healthchecks

- API: [http://localhost:3000/healthz](http://localhost:3000/healthz)
- Redis: [http://localhost:3000/healthz/redis](http://localhost:3000/healthz/redis)

> On WSL, if `curl` is quirky, open in browser or use `curl.exe` from PowerShell.

---

## MAL Provider Endpoints

**Base path:** `/providers/mal/anime`

### Search

```http
GET /providers/mal/anime/search?q=<query>&limit=10&offset=0
```

- Returns: `items`, `hasMore`, `nextOffset` (from MAL paging), and `meta` (debug info).
- **Cache key:** `mal:search:<normalized-q>:<limit>:<offset>`
- **TTL:** 3600s (1 hour)

---

### By ID

```http
GET /providers/mal/anime/:id
```

- Returns MAL fields (title, pictures, mean score, etc).
- **Cache key:** `mal:anime:<id>`
- **TTL:** 86400s (24 hours)

---

### Cache Purge (Dev Helpers)

```http
DELETE /providers/mal/anime/cache/:id
DELETE /providers/mal/anime/cache/search?q=<query>
```

> Route order matters in Nest/Express: declare `cache/search` before `cache/:id`, or constrain the param like `@Delete('cache/:id(\\d+)')`.

---

## Caching Details

- **Search TTL:** 1h
- **ById TTL:** 24h

**Keys:**

- Search → `mal:search:<normalized-q>:<limit>:<offset>`
- ById → `mal:anime:<id>`

**RedisService helpers:**

- `get`/`set`/`del` for JSON values
- `delPattern(pattern)` implemented with SCAN (safe; avoids blocking KEYS)

---

## Useful Commands

### Docker

```bash
docker compose up -d
docker compose down && docker compose up -d
docker compose ps
docker compose logs -f redis
docker compose exec redis redis-cli -a "$REDIS_PASSWORD" TTL mal:anime:21
```

### API

```bash
npm run start:dev
# when running in watch mode:
rs
```

---

## Project Structure (Excerpt)

```
src/
  app.module.ts
  health.controller.ts
  mal/
    mal.controller.ts
    mal.module.ts
    mal.service.ts
  redis/
    redis.constants.ts
    redis.module.ts
    redis.service.ts
```

---

## Roadmap

- Modules for Movies / TV / Music / Books / Games
- User lists, ratings, favorites
- Auth (JWT), roles/permissions
- TypeORM entities & migrations
- More providers & caching policies
- Observability (metrics/logs, cache hit ratio)

---

## Security

- **Never commit secrets** (`.env`, MAL client secret, etc.).
- Redis runs with password & AOF for durability.
- For production: consider managed Redis/TLS and a secrets manager.

---

## License

MIT
