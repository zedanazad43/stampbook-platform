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

The server listens on port `8080` by default (configurable via `PORT` environment variable).

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
|--------|------|-------------|
| POST | `/api/wallet/create` | Create a new wallet |
| GET | `/api/wallet/:userId` | Get wallet by user ID |
| POST | `/api/wallet/transfer` | Transfer balance between wallets |
| GET | `/api/wallet/:userId/transactions` | Get transaction history |
| POST | `/api/wallet/:userId/stamps` | Add stamp (🔒 auth required) |
| GET | `/api/wallets` | List all wallets (🔒 auth required) |

### Market
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/market/items` | Get all items (supports filtering) |
| POST | `/api/market/items` | List a new item |
| GET | `/api/market/items/:itemId` | Get item by ID |
| PUT | `/api/market/items/:itemId` | Update item (seller only) |
| POST | `/api/market/items/:itemId/buy` | Purchase an item |
| DELETE | `/api/market/items/:itemId` | Remove item (seller only) |
| GET | `/api/market/transactions` | Get transaction history |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: `8080`) |
| `SYNC_TOKEN` | Bearer token for protected endpoints |
| `NODE_ENV` | Set to `production` to enforce auth |
| `STP_CONTRACT_ADDRESS` | On-chain contract address |

## License

MIT
