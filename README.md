# Stampcoin Platform (stp)

A blockchain-inspired digital stamps platform with wallet and marketplace features.

## Features

- **Digital Wallet API** — Create and manage digital wallets, balances, and stamps
- **Market Institution API** — List, browse, update, and purchase digital stamps
- **Blockchain Module** — BEP-20-compatible STP token supply tracking
- **Secure transfers** — Peer-to-peer balance and stamp transfers

## Quick Start

```bash
# Clone repository
git clone https://github.com/zedanazad43/stp.git
cd stp

# Install dependencies
npm install

# Start the server
npm start
```

The server listens on port `10000` by default (configurable via `PORT` environment variable).

## API Documentation

- [WALLET_API.md](WALLET_API.md) — Digital Wallet API endpoints
- [MARKET_API.md](MARKET_API.md) — Market Institution API endpoints

## Testing

```bash
npm test
```

All tests use Jest with mocked file system (no disk I/O during tests).

## Key API Endpoints

### Wallet

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/api/wallet/create` | Create a new wallet |
| GET | `/api/wallet/:userId` | Get wallet by user ID |
| POST | `/api/wallet/transfer` | Transfer balance between wallets |
| GET | `/api/wallet/:userId/transactions` | Get transaction history |
| POST | `/api/wallet/:userId/stamps` | Add stamp (🔒 auth required) |
| GET | `/api/wallets` | List all wallets (🔒 auth required) |

### Market

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/market/items` | Get all items (supports filtering) |
| POST | `/api/market/items` | List a new item |
| GET | `/api/market/items/:itemId` | Get item by ID |
| PUT | `/api/market/items/:itemId` | Update item (seller only) |
| POST | `/api/market/items/:itemId/buy` | Purchase an item |
| DELETE | `/api/market/items/:itemId` | Remove item (seller only) |
| GET | `/api/market/transactions` | Get transaction history |

## Environment Variables

| Variable | Description |
| -------- | ----------- |
| `PORT` | Server port (default: `10000`) |
| `BASE_URL` | Public HTTPS URL for the app, for example `https://app.example.com` |
| `CANONICAL_HOST` | Hostname to force in production redirects, for example `app.example.com` |
| `ALLOWED_ORIGINS` | Comma-separated list of frontend origins allowed by CORS |
| `SYNC_TOKEN` | Bearer token for protected endpoints |
| `NODE_ENV` | Set to `production` to enforce auth |
| `STP_CONTRACT_ADDRESS` | On-chain contract address |

## Custom Domain and DNS

This project supports a custom production domain through the `BASE_URL` and `CANONICAL_HOST` environment variables.

1. In Render, open your web service and add your custom domain, such as `app.example.com`.
2. Copy the DNS target that Render shows you.
3. In your DNS provider, create the record requested by Render:
   - For a subdomain such as `app.example.com`, create a `CNAME` record pointing to the Render target.
   - For the apex domain such as `example.com`, use the `A`, `ALIAS`, or `ANAME` record type supported by your DNS provider exactly as Render instructs.
4. Set these environment variables on the service:
   - `BASE_URL=https://app.example.com`
   - `CANONICAL_HOST=app.example.com`
   - `ALLOWED_ORIGINS=https://app.example.com,https://www.example.com`
5. Redeploy the service after DNS has propagated.

In production, requests that arrive on a non-canonical host are redirected to `CANONICAL_HOST`, and `/api/site` returns the active public URL and allowed origins.

## Self-Hosting on Your Own Computer

If you want to run the site, HTTPS endpoint, and domain binding from your own machine instead of a cloud host, use the self-hosting bundle in [SELF_HOSTING.md](SELF_HOSTING.md).

Main files:

- `docker-compose.selfhost.yml`
- `Caddyfile`
- `.env.selfhost.example`
- `deploy-local.cmd`

This mode keeps application data in a persistent Docker volume and publishes the site through your own domain.

## Hybrid High-Availability (Local + Cloud)

For `ecostamp.net`, use the hybrid deployment guide in [HYBRID_DEPLOYMENT_CLOUDFLARE.md](HYBRID_DEPLOYMENT_CLOUDFLARE.md) to combine:

- cloud origin (Render)
- local origin (your computer)
- Cloudflare failover routing

This gives you continuity when your local machine is offline.

## License

MIT
