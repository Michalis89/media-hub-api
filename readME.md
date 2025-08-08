## Local Dev (Docker + Nest)

### 1) Start infra (Postgres + Redis)

```bash
docker compose up -d
docker compose ps
docker compose exec redis redis-cli -a "$REDIS_PASSWORD" ping   # πρέπει: PONG
```

### 2) Start API

```bash
npm i
npm run start:dev
# σε watch mode: πάτα rs για restart
```

### 3) Healthchecks

- API: http://localhost:3000/healthz
- Redis: http://localhost:3000/healthz/redis

### 4) Useful

```bash
docker compose logs -f redis
docker compose exec redis redis-cli -a "$REDIS_PASSWORD" TTL mal:anime:21
docker compose down && docker compose up -d

```
