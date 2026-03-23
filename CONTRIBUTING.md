# Contributing to Stampcoin Platform 🏷️

Thank you for your interest in contributing to Stampcoin — the world's first digital philatelic trading platform!

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Setup

```bash
git clone https://github.com/zedanazad43/stp.git
cd stp
npm install
npm test
npm start
```

## Development Workflow

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/my-feature`)
3. Write your code and **tests**
4. Ensure all tests pass: `npm test`
5. Verify the server starts: `node -e "require('./server.js')" && echo OK`
6. **Commit** your changes with a clear message
7. **Push** to your fork and open a **Pull Request**

## Code Standards

- **Indentation**: 2 spaces (no tabs)
- **Strings**: Double quotes in JS files
- **Language**: JavaScript (Node.js 18+)
- **Error handling**: Wrap route handlers in `try/catch`, return `res.status(4xx/5xx).json({ error: e.message })` on failure
- Do **not** commit secrets or API tokens — use `process.env` for all sensitive values

## Testing

```bash
# Run all tests
npm test

# Run a specific test file
npx jest tests/wallet.test.js
```

Tests live in `tests/` and use Jest with a mocked filesystem so no disk I/O occurs during tests.

## Adding New API Endpoints

1. Add your route handler to `server.js`
2. Follow the existing REST pattern: `POST` for mutations, `GET` for reads, `PUT` for updates, `DELETE` for removal
3. All API routes must be prefixed with `/api/`
4. Return JSON responses for all endpoints
5. Document the new endpoint in `WALLET_API.md` or `MARKET_API.md`
6. Add unit tests in the appropriate test file

## Merging Pull Requests via Command Line

If the GitHub UI merge button is unavailable or you prefer the command line, use the steps below. This workflow requires that the `main` branch is **not** protected (no required status checks or merge restrictions).

```bash
# Step 1 — Fetch the latest state of the repository
git fetch origin

# Step 2 — Switch to the base branch and align it with the remote
git checkout main
git merge origin/main   # fast-forward to latest remote state

# Step 3 — Merge the feature branch into main
git merge <feature-branch-name>
# e.g.: git merge copilot/add-frontend-platform-stamp-trading

# Step 4 — Push the result
git push origin main
```

### Example for PR #258

```bash
git fetch origin
git checkout main
git merge origin/main
git merge copilot/add-frontend-platform-stamp-trading
git push origin main
```

> **Note:** Always ensure `npm test` passes (all 54 tests) before pushing to `main`.

## Reporting Bugs

Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template when creating issues.

## Requesting Features

Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template when requesting new features.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
