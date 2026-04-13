# Changelog

All notable changes to **Stampbook Platform** are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.1.0] — 2026-04-13

### Added
- **Helmet.js** — HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, etc.)
- **Morgan** — HTTP request logging in combined format (disabled in test environment)
- **Rate limiting** — `express-rate-limit` applied to all API routes (120 req/min) and auth routes (20 req/15 min)
- **Input validation** — email format check (RFC regex) and minimum password length (8 chars) on register/change-password
- **`POST /api/auth/change-password`** — authenticated users can change their password securely
- **`DELETE /api/auctions/:id`** — sellers can cancel auctions that have not yet received bids
- **`GET /api/my/balance`** — returns current user's `stpBalance` and `points`
- **Pagination** — `?page=&limit=` query parameters on `/api/nfts`, `/api/auctions`, `/api/market/items` (all return `{ data, meta }`)
- **Text search** — `?q=` full-text filter on `/api/market/items`
- **Own-auction bid guard** — users cannot bid on their own auctions (returns 400)
- **Production warnings** — server logs when `JWT_SECRET` or `SYNC_TOKEN` are unset in production
- **`.env.example`** — template for local development environment variables
- **`engines` field** in `package.json` — Node.js ≥ 18, npm ≥ 9
- **Integration test suite** — `tests/server.test.js` with 40 tests covering all major API routes via supertest (total: 98 tests)
- **`README.md`** — comprehensive documentation: features, quickstart, API reference table, Render + Cloudflare Pages deployment guide

### Changed
- `nodemon` added as devDependency — `npm run dev` now works correctly

---

## [3.0.0] — 2026-04-12

### Added
- Full Express.js API server (`server.js`) with JWT authentication
- Digital wallet module (`wallet.js`) — balances, transfers, stamps
- Marketplace module (`market.js`) — listing, buying, contact-leak prevention
- Blockchain module (`blockchain.js`) — STP BEP-20 token supply tracking
- Cloudflare Pages function proxy (`functions/api/[[route]].js`)
- Deployment configurations: Render, Fly.io, Railway, Cloudflare Pages, Vercel
- GitHub Actions CI/CD workflows: build-and-test, Cloudflare Pages deploy, Fly.io deploy, Railway deploy
- Arabic SPA frontend (`public/index.html`) with multilingual support (10 languages)
- Smart contract (`STP-Token.sol`) and Hardhat config
- Docker and docker-compose configs for self-hosting
- 60 unit tests across wallet, market, and blockchain modules

---

## [2.x] — Legacy

Earlier versions of the Stampcoin (STP) platform are not documented in this changelog.
To view historical commits, see the [GitHub commit history](https://github.com/zedanazad43/stampbook-platform/commits/main).
