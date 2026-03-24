# Self-Hosting Stampcoin Platform

This setup lets you run the application, TLS termination, and the public domain endpoint from your own computer.

## What This Bundle Includes

- `docker-compose.selfhost.yml` for the application and reverse proxy
- `Caddyfile` for HTTPS, reverse proxying, and security headers
- `.env.selfhost.example` for required production variables
- `deploy-local.cmd`, `stop-local.cmd`, and `logs-local.cmd` for Windows-based operations
- persistent application data mounted into the container through `DATA_DIR=/app/data`

## Requirements

1. Windows machine that stays online
2. Docker Desktop with Docker Compose enabled
3. A domain or subdomain you control
4. Router access for port forwarding
5. An email address for ACME certificate registration

## One-Time Setup

1. Copy `.env.selfhost.example` to `.env.selfhost`.
2. Set `APP_DOMAIN` to the exact host name you want to publish, such as `app.example.com`.
3. Set `ACME_EMAIL` to an email you control.
4. Set `SYNC_TOKEN` to a long random secret.
5. If needed, set `STP_CONTRACT_ADDRESS`.

## Network and DNS Setup

1. Give your computer a static LAN IP address or a DHCP reservation.
2. Forward router ports `80` and `443` to that machine.
3. Point your DNS record to your public IP address:
   - Use an `A` record for an apex domain such as `example.com`.
   - Use an `A` record or your DNS provider's preferred record type for a subdomain such as `app.example.com`.
4. If your ISP changes your public IP, use a dynamic DNS provider or an API-updated DNS setup.

## First Deployment

Run:

```cmd
copy .env.selfhost.example .env.selfhost
deploy-local.cmd
```

After startup, verify:

```cmd
docker compose --env-file .env.selfhost -f docker-compose.selfhost.yml ps
docker compose --env-file .env.selfhost -f docker-compose.selfhost.yml logs -f
```

Then open:

- `https://YOUR_DOMAIN/`
- `https://YOUR_DOMAIN/health`
- `https://YOUR_DOMAIN/api/site`

## Updating the Site from Your Computer

Every time you change code locally:

```cmd
git pull
deploy-local.cmd
```

This rebuilds the app container and keeps persistent data in the named Docker volume.

## Backups

Application state is stored in the Docker volume `stampcoin_data`.
Back up that volume regularly before major updates.

## Security Notes

1. Keep Windows and Docker updated.
2. Do not leave `SYNC_TOKEN` empty in production.
3. Restrict router administration access.
4. Use a strong account password on the machine hosting the service.
5. Only expose ports `80` and `443` publicly.

## Limitations

- This setup depends on your computer and internet connection staying online.
- Residential ISPs may block inbound ports or rotate public IPs.
- If direct inbound traffic is blocked, use a tunnel or VPS reverse proxy in front of your home machine.
