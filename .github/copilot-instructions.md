# Copilot Instructions for Stampcoin Platform (stp)

This is a Node.js/Express.js repository for the **Stampcoin Platform**  a blockchain-inspired digital stamps platform with wallet and marketplace features. The project also includes a static frontend served via GitHub Pages.

## Repository Structure

- `server.js`  Main Express.js API server (wallet & market endpoints)
- `wallet.js` / `market.js`  Core business logic for wallet and marketplace
- `index.js`  Entry point / helper utilities
- `index.html`  Static frontend homepage
- `public/`  Static frontend assets
- `locales/`  i18n translation files (supports Arabic, English, German, Chinese, French, Spanish)
- `docs/`  Documentation and GitHub Pages site
- `scripts/`  Helper scripts
- `server/`  Additional server-side modules
- `lib/`  Shared library code
- `.github/workflows/`  CI/CD GitHub Actions workflows

## Development Flow

```bash
# Install dependencies
npm install

# Start development server
npm start          # runs: node server.js

# Build (no compile step needed for plain Node.js)
npm run build      # echo 'No build needed'
```

## Key Guidelines

1. **Language**: JavaScript (Node.js 18+). Follow standard JS idioms; no TypeScript unless already present.
2. **Dependencies**: Use `npm ci` when `package-lock.json` is present (as done in CI). Run `npm install` locally.
3. **Style**: Match the existing code style  2-space indentation, double quotes for strings in JS files.
4. **Security**: Never commit secrets or private keys. Use environment variables (e.g., `process.env.SYNC_TOKEN`).
5. **i18n**: The platform supports multiple languages. When adding user-facing strings, add translations to all locale files in `locales/`.
6. **API changes**: Document any new API endpoints in `WALLET_API.md` or `MARKET_API.md` as appropriate.
7. **Tests**: Run `npm test` if a test suite is available. The CI workflow uses `npm ci` then runs tests.
8. **Docker**: The project is Docker-ready. Ensure changes don't break `docker compose up --build`.

## CI/CD

- Workflows are in `.github/workflows/`
- `build-and-test.yml`  Runs on pushes/PRs to `main`/`develop`; installs deps and runs tests
- `pages.yml`  Deploys the static site to GitHub Pages
- `publish.yml`  Publishes/deploys the application

All CI workflows use **Node.js 18** and npm caching.
