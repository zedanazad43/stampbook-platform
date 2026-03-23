# 🏷️ Stampcoin Platform (STP)

> **منصة تداول الطوابع البريدية الرقمية** — The world's first digital philatelic trading platform powered by blockchain technology.

[![Deploy to GitHub Pages](https://github.com/zedanazad43/stp/actions/workflows/pages.yml/badge.svg)](https://github.com/zedanazad43/stp/actions/workflows/pages.yml)
[![Build & Test](https://github.com/zedanazad43/stp/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/zedanazad43/stp/actions/workflows/build-and-test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)

---

## 🌐 Live Platform

| Platform | URL |
|----------|-----|
| **Website** | [https://zedanazad43.github.io/stp/](https://zedanazad43.github.io/stp/) |
| **API Server** | Deploy via Render / Railway (see below) |
| **Android App** | Available via GitHub Releases |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏪 **Digital Stamp Market** | Buy and sell rare philatelic NFTs in a live marketplace |
| 🔴 **Live Auctions** | Compete in real-time auctions for the world's rarest stamps |
| 💼 **STP/NFT Wallet** | Manage STP token balance and NFT stamp portfolio |
| 🎨 **Stamp-to-NFT Minting** | Authenticate and mint physical stamps as blockchain NFTs |
| 📚 **Stamp Archive** | Searchable database of 50,000+ historical stamps |
| 📊 **Analytics Dashboard** | Real-time market statistics, charts, and trading data |
| 🔐 **Secure Transfers** | Peer-to-peer STP token and stamp transfers |
| 📱 **Mobile Ready** | Responsive PWA + Android/iOS build support |

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/zedanazad43/stp.git
cd stp

# Install dependencies
npm install

# Start the server
npm start
```

The server listens on port `8080` by default (configurable via `PORT` environment variable).

## API Documentation

- [WALLET_API.md](WALLET_API.md) — Digital Wallet API endpoints
- [MARKET_API.md](MARKET_API.md) — Market Institution API endpoints
- [BLOCKCHAIN_API.md](BLOCKCHAIN_API.md) — Blockchain & STP Token API endpoints

Open [http://localhost:10000](http://localhost:10000) to view the platform.

---

## 🔌 API Reference

### Wallet API
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/wallet/create` | Create a new STP wallet |
| GET | `/api/wallet/:userId` | Get wallet by user ID |
| POST | `/api/wallet/transfer` | Transfer STP between wallets |
| GET | `/api/wallet/:userId/transactions` | Get transaction history |
| POST | `/api/wallet/:userId/stamps` | Add stamp to wallet (🔒 auth) |
| POST | `/api/wallet/:userId/topup` | Top up wallet balance (🔒 auth) |
| GET | `/api/wallets` | List all wallets (🔒 auth) |

### Market API
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/market/items` | Get all market items |
| POST | `/api/market/items` | List a new stamp for sale |
| GET | `/api/market/items/:itemId` | Get item by ID |
| PUT | `/api/market/items/:itemId` | Update item (seller only) |
| POST | `/api/market/items/:itemId/buy` | Purchase a stamp |
| DELETE | `/api/market/items/:itemId` | Remove item (seller only) |
| GET | `/api/market/transactions` | Get trade history |

### Auction API
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auctions` | List all auctions (`?status=active`) |
| POST | `/api/auctions` | Create a new auction |
| GET | `/api/auctions/:id` | Get auction by ID |
| POST | `/api/auctions/:id/bid` | Place a bid |

### NFT API
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/nft/stamps` | List NFT stamps (`?ownerId=`) |
| POST | `/api/nft/mint` | Mint a new NFT stamp |
| GET | `/api/nft/stamps/:tokenId` | Get NFT stamp by token ID |

### Blockchain API
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/blockchain/info` | Get token metadata |
| GET | `/api/blockchain/supply` | Get STP token supply stats |
| POST | `/api/blockchain/mint` | Mint STP tokens (🔒 auth) |
| GET | `/api/blockchain/balance/:address` | Get address STP balance |
| GET | `/api/blockchain/mint/events` | Mint audit log (🔒 auth) |

### User API
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/users/register` | Register a new user + create wallet |
| GET | `/api/users/:userId` | Get user profile |

Full documentation: [WALLET_API.md](WALLET_API.md) · [MARKET_API.md](MARKET_API.md)

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `10000` | Server port |
| `SYNC_TOKEN` | _(none)_ | Bearer token for protected endpoints |
| `NODE_ENV` | `development` | Set `production` to enforce auth |
| `STP_CONTRACT_ADDRESS` | `0xeB834351Ee83b3877DD8620e552652733710d4e1` | On-chain ERC-20 contract address |
| `ALLOWED_ORIGINS` | localhost | Comma-separated CORS origins |

---

## 🏗️ Architecture

```
stp/
├── server.js          # Express.js API server (all routes)
├── wallet.js          # Wallet & transaction business logic
├── market.js          # Marketplace business logic
├── blockchain.js      # STP token (BEP-20 compatible) logic
├── index.js           # Entry point
├── public/
│   └── index.html     # Full-featured SPA frontend (Tailwind + Alpine.js)
├── tests/             # Jest unit tests
├── .github/
│   └── workflows/
│       ├── pages.yml              # Auto-deploy to GitHub Pages
│       ├── build-and-test.yml     # CI: build & test on push/PR
│       ├── mobile-build.yml       # Android APK build
│       └── railway-deploy.yml     # Deploy API to Railway
├── Dockerfile         # Container for API server
├── render.yaml        # Render.com deployment config
└── README.md
```

---

## 🚢 Deployment

### GitHub Pages (Frontend — Automatic)
Every push to `main` automatically deploys the frontend to:
```
https://zedanazad43.github.io/stp/
```

### Render.com (API Server)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Railway (API Server)
Add `RAILWAY_TOKEN` to repository secrets, then push to `main`.

### Docker
```bash
docker build -t stampcoin-platform .
docker run -p 10000:10000 -e SYNC_TOKEN=your_secret stampcoin-platform
```

---

## 📱 Mobile App

The platform is a Progressive Web App (PWA) — install it directly from the browser.

For native Android/iOS builds using Expo:
```bash
cd mobile          # (create with: npx create-expo-app mobile)
npm install
npx expo build:android   # Android APK
```

> See `.github/workflows/mobile-build.yml` for automated APK builds.

---

## 🧪 Testing

```bash
npm test
```

---

## 🪙 STP Token Economics

| Parameter | Value |
|-----------|-------|
| **Name** | Stampcoin |
| **Symbol** | STP |
| **Total Supply** | 421,000,000 STP |
| **Network** | EVM-compatible |
| **Standard** | ERC-20 (BEP-20 compatible) |

| Distribution | % | Amount |
|-------------|---|--------|
| Public ICO Sale | 20% | 84,200,000 |
| Ecosystem & Partners | 20% | 84,200,000 |
| Community & Rewards | 20% | 84,200,000 |
| Liquidity Pool | 15% | 63,150,000 |
| Team & Founders | 15% | 63,150,000 |
| Reserve | 10% | 42,100,000 |

---

| Variable | Description |
| -------- | ----------- |
| `PORT` | Server port (default: `10000`) |
| `BASE_URL` | Public HTTPS URL for the app, for example `https://app.example.com` |
| `CANONICAL_HOST` | Hostname to force in production redirects, for example `app.example.com` |
| `ALLOWED_ORIGINS` | Comma-separated list of frontend origins allowed by CORS |
| `SYNC_TOKEN` | Bearer token for protected endpoints |
| `NODE_ENV` | Set to `production` to enforce auth |
| `STP_CONTRACT_ADDRESS` | `0xeB834351Ee83b3877DD8620e552652733710d4e1` |

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT © 2025 [zedanazad43](https://github.com/zedanazad43)

---

*Built with ❤️ for the global philatelic community*
