docker compose up -d # ανεβάζει DB + Redis
docker compose ps # βλέπεις status
docker compose exec redis redis-cli -a "$REDIS_PASSWORD" ping
npm run start:dev # ξεκινάς API
curl http://127.0.0.1:3000/healthz
curl http://127.0.0.1:3000/healthz/redis
