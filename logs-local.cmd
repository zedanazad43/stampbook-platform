@echo off
setlocal
docker compose --env-file .env.selfhost -f docker-compose.selfhost.yml logs -f
