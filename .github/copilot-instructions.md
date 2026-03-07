# Copilot Instructions for Stampcoin Platform (stp)

This is a Node.js/Express.js repository for the **Stampcoin Platform** — a blockchain-inspired digital stamps platform with wallet and marketplace features.

## Repository Structure

- `server.js` — Main Express.js API server (wallet, market & blockchain endpoints)
- `wallet.js` — Core business logic for digital wallets, balances, stamps, and transactions
- `market.js` — Core business logic for the digital stamps marketplace
- `blockchain.js` — BEP-20-compatible token logic for STP token supply tracking
- `index.js` — Entry point that starts the server
- `tests/` — Jest unit tests (`wallet.test.js`, `market.test.js`, `blockchain.test.js`)
- `WALLET_API.md` — Digital Wallet API documentation
- `MARKET_API.md` — Market Institution API documentation
- `wallets.json`, `transactions.json`, `market-data.json` — Runtime data files (JSON-based persistence)

## Development Flow

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test
```

## Code Standards

### Required Before Each Commit
- Verify that all modules load without errors: `node -e "require('./wallet.js'); require('./market.js'); require('./blockchain.js'); console.log('OK')"`
- Ensure no secrets, tokens, or private keys are introduced — use `process.env` for all sensitive values (e.g., `process.env.SYNC_TOKEN`).

### Style
- **Indentation**: 2 spaces (no tabs)
- **Strings**: Double quotes in JS files
- **Language**: JavaScript (Node.js 18+)
- **Error handling**: Wrap route handlers in `try/catch`, return `res.status(4xx/5xx).json({ error: e.message })` on failure

### Data Persistence
- Wallet and transaction state live in `wallets.json` and `transactions.json` (root of repo).
- Market state lives in `market-data.json` (root of repo).
- Always read/write these files using the helper functions in `wallet.js` and `market.js`.

### API Design
- Follow the existing REST pattern in `server.js`: `POST` for mutations, `GET` for reads, `PUT` for updates, `DELETE` for removal.
- All API routes are prefixed with `/api/`.
- Return JSON responses for all API endpoints.
- Document any new endpoints in `WALLET_API.md` or `MARKET_API.md`.

## Key API Endpoints

### Wallet API
- `POST /api/wallet/create` — Create a new wallet
- `GET /api/wallet/:userId` — Get wallet by user ID
- `POST /api/wallet/transfer` — Transfer balance between wallets
- `GET /api/wallet/:userId/transactions` — Get transaction history
- `POST /api/wallet/:userId/stamps` — Add a stamp (token-protected)
- `GET /api/wallets` — List all wallets (token-protected admin endpoint)
- `POST /api/wallet/:userId/topup` — Top up wallet balance (token-protected)

### Market API
- `GET /api/market/items` — Get all market items (supports `?status=`, `?type=`)
- `POST /api/market/items` — List a new item
- `GET /api/market/items/:itemId` — Get item by ID
- `PUT /api/market/items/:itemId` — Update item (seller only)
- `POST /api/market/items/:itemId/buy` — Purchase an item
- `DELETE /api/market/items/:itemId` — Remove an item (seller only)
- `GET /api/market/transactions` — Get transaction history (supports `?buyerId=`, `?sellerId=`)

### Blockchain API
- `GET /api/blockchain/info` — Get token metadata
- `GET /api/blockchain/supply` — Get token supply stats
- `POST /api/blockchain/mint` — Mint STP tokens (token-protected)
- `GET /api/blockchain/balance/:address` — Get address balance
- `GET /api/blockchain/mint/events` — Get mint audit log (token-protected)

## CI/CD

- `.github/workflows/build-and-test.yml` — Runs on PRs/pushes to `main`; installs deps and runs `npm test`
- `.github/workflows/copilot-setup-steps.yml` — Sets up the environment for Copilot coding agent
