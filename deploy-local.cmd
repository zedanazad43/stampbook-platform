@echo off
setlocal

if not exist ".env.selfhost" (
  echo Missing .env.selfhost file.
  echo Copy .env.selfhost.example to .env.selfhost and update the values first.
  exit /b 1
)

docker compose --env-file .env.selfhost -f docker-compose.selfhost.yml up -d --build
if errorlevel 1 exit /b %errorlevel%

docker compose --env-file .env.selfhost -f docker-compose.selfhost.yml ps
