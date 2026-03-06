# Copilot Instructions for Stampcoin Platform (stp)

This is a Node.js/Express.js repository for the **Stampcoin Platform** — a blockchain-inspired digital stamps platform with wallet and marketplace features. The project also includes a static frontend served via GitHub Pages.

## Repository Structure

- `server.js` — Main Express.js API server (wallet & market endpoints, static file serving, health check)
- `wallet.js` — Core business logic for digital wallets, balances, and transactions
- `market.js` — Core business logic for the digital stamps marketplace
- `index.js` — Contains Dockerfile-like bootstrap content (not standard JavaScript)
- `index.html` — Static frontend homepage
- `public/` — Static frontend assets served by Express
- `locales/` — i18n translation files (`ar.json`, `de.json`, `en.json`, `es.json`, `fr.json`, `zh.json`)
- `docs/` — Documentation and GitHub Pages site
- `scripts/` — Helper scripts
- `server/` — Additional server-side modules (includes TypeScript files)
- `lib/` — Shared library code
- `admin/` — Admin interface components
- `proto/` — Protocol buffer definitions
- `.github/workflows/` — CI/CD GitHub Actions workflows
- `wallets.json`, `transactions.json`, `market-data.json` — Runtime data files (JSON-based persistence, do not commit sensitive data)

## Development Flow

```bash
# Install dependencies
npm install

# Start development server
npm start          # runs: node server.js (listens on PORT env var or default)

# Build (no compile step needed for plain Node.js)
npm run build      # echo 'No build needed'

# Validate the server starts correctly
node -e "require('./server.js')" 2>&1 | head -5

# Validate individual modules load without errors
node -e "require('./wallet.js'); console.log('wallet OK')"
node -e "require('./market.js'); console.log('market OK')"
```

## Code Standards

### Required Before Each Commit
- Verify that the server and all modules load without errors using `node -e "require('./server.js')"` (or the individual module checks above).
- Ensure no secrets, tokens, or private keys are introduced — use `process.env` for all sensitive values (e.g., `process.env.SYNC_TOKEN`).
- If adding user-facing strings, add translations to **all six** locale files in `locales/` (`ar.json`, `de.json`, `en.json`, `es.json`, `fr.json`, `zh.json`).

### Style
- **Indentation**: 2 spaces (no tabs)
- **Strings**: Double quotes in JS files (`"like this"`)
- **Language**: JavaScript (Node.js 18+). Follow standard JS idioms. TypeScript is only acceptable in `server/` where it already exists.
- **Error handling**: Wrap route handlers in `try/catch`, return `res.status(4xx/5xx).json({ error: e.message })` on failure — matching the pattern in `server.js`.
- **Comments**: Use JSDoc-style block comments for functions (see `wallet.js` for examples).

### Data Persistence
- Wallet and transaction state live in `wallets.json` and `transactions.json` (root of repo).
- Market state lives in `market-data.json` (root of repo).
- Always read/write these files using the helper functions already defined in `wallet.js` and `market.js` — do not bypass them.
- Never commit real user data. These JSON files are for development use only.

### API Design
- Follow the existing REST pattern in `server.js`: `POST` for mutations, `GET` for reads.
- All API routes are prefixed with `/api/`.
- Return JSON responses for all API endpoints.
- Document any new API endpoints in `WALLET_API.md` or `MARKET_API.md` as appropriate.
- The `/health` endpoint must always remain functional (used by Docker healthchecks).

## Key Guidelines

1. **Language**: JavaScript (Node.js 18+). Follow standard JS idioms; no TypeScript unless already present.
2. **Dependencies**: Use `npm ci` when `package-lock.json` is present (as done in CI). Run `npm install` locally.
3. **Security**: Never commit secrets or private keys. Use environment variables (e.g., `process.env.SYNC_TOKEN`).
4. **i18n**: The platform supports multiple languages. When adding user-facing strings, add translations to all locale files in `locales/`.
5. **API changes**: Document any new API endpoints in `WALLET_API.md` or `MARKET_API.md` as appropriate.
6. **Tests**: Run `npm test` if a test suite is available. The `build-and-test.yml` CI workflow currently only runs `npm ci` to install dependencies.
7. **Docker**: The project is Docker-ready. Ensure changes don't break `docker compose up --build`.

## CI/CD

- Workflows are in `.github/workflows/`
- `build-and-test.yml` — Runs on pushes/PRs to `main`/`develop`; installs deps with `npm ci`
- `pages.yml` — Deploys the static site to **Cloudflare Pages** (requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets; skipped gracefully if not configured)
- `publish.yml` — Publishes/deploys the application
- `railway-deploy.yml` — Deploys to Railway (uses `RAILWAY_TOKEN`, `RAILWAY_SERVICE_ID`, `RAILWAY_PROJECT_ID` secrets)
- `codeql.yml` — Runs CodeQL security analysis
- `copilot-setup-steps.yml` — Sets up the environment for Copilot coding agent

All CI workflows use **Node.js 18** and npm caching via `actions/setup-node@v4`.
