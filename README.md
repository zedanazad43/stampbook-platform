# Stampcoin Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](Dockerfile)

An innovative blockchain-based digital stamps platform with wallet and marketplace features.

**[Live Demo](https://zedanazad43.github.io/stp/)** | **[Documentation](docs/)** | **[Roadmap](docs/roadmap.html)**

---

## Languages

- **Arabic** | **English** | **Deutsch** | **Chinese** | **Francais** | **Espanol**

---

## Features

- **Digital Wallet API** - Create, manage, and transfer digital stamps securely
- **Market Institution API** - Buy, sell, and trade digital stamps in a marketplace
- **Secure P2P Transfers** - Peer-to-peer transactions with full transaction history
- **Multi-Language Support** - 6+ languages supported
- **Docker Ready** - Full Docker and Docker Compose support
- **High Performance** - Built with Express.js and Node.js

---

## Quick Start

### Prerequisites
- Node.js >= 16.x
- Git
- Docker (optional, recommended)

### Using Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/zedanazad43/stp.git
cd stp

# Start with Docker Compose
docker compose up --build

# Access at http://localhost:8080
```

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:8080
```

---

## Installation & Setup

See detailed guides:
- **[Installation Guide](INSTALLATION.md)**
- **[Windows Setup](WINDOWS_SETUP.md)**
- **[Quick Start](QUICKSTART.md)**

---

## API Documentation

### Wallet API
Complete wallet management endpoints and examples: **[WALLET_API.md](WALLET_API.md)**

### Market API
Complete marketplace endpoints and examples: **[MARKET_API.md](MARKET_API.md)**

---

## Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linting
npm lint
```

### Docker Commands

```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run

# Or use Docker Compose
docker compose up
docker compose down
```

---

## Full Documentation

- **[Online Documentation Portal](https://zedanazad43.github.io/stp/)**
- **[docs/ Directory](docs/)**
- **[Security Guidelines](SECURITY.md)**
- **[Deployment Guide](DEPLOYMENT.md)**
- **[Contributing Guide](CONTRIBUTING.md)**

---

## Security

For security information and guidelines, see **[SECURITY.md](SECURITY.md)**.

**Important**: Always use HTTPS in production and keep your private keys secure.

---

## License

This project is licensed under the MIT License - see **[LICENSE](LICENSE)** for details.

---

## Contributing

Contributions are welcome! See **[CONTRIBUTING.md](CONTRIBUTING.md)** for guidelines.

---

## Contact & Support

- **Author**: Azad Zedan
- **Repository**: [github.com/zedanazad43/stp](https://github.com/zedanazad43/stp)
- **Issues**: [GitHub Issues](https://github.com/zedanazad43/stp/issues)

---

## Website

**Live Website**: https://zedanazad43.github.io/stp/

---

## Changelog

See **[CHANGELOG.md](CHANGELOG.md)** for version history and updates.

---

**Last Updated**: 2025
**Status**: Active Development

---

## GitHub Actions Runner Setup

This section explains how to set up a self-hosted GitHub Actions Runner.

### Prerequisites
- A GitHub account
- A Windows machine
- PowerShell

### Runner Setup Steps

#### Step 1: Download GitHub Actions Runner

1. Open PowerShell
2. Create a directory for the runner:
   ```
   mkdir actions-runner
   cd actions-runner
   ```
3. Download the runner (Windows):
   ```
   curl -o actions-runner-win-x64-2.331.0.zip -L https://github.com/actions/runner/releases/download/v2.331.0/actions-runner-win-x64-2.331.0.zip
   ```
4. Extract the archive:
   ```
   Expand-Archive -Path actions-runner-win-x64-2.331.0.zip -DestinationPath .
   ```

#### Step 2: Get the Runner URL and Token

1. Go to your repository on GitHub
2. Click Settings
3. Click Actions
4. Click Runners
5. Click New runner
6. Copy the URL and token shown

#### Step 3: Configure the Runner

1. In PowerShell, navigate to the runner directory:
   ```
   cd C:\Users\azadz\actions-runner
   ```
2. Configure the runner with your URL and token:
   ```
   .\config.cmd --url YOUR_REPO_URL --token YOUR_RUNNER_TOKEN
   ```
   Replace `YOUR_REPO_URL` and `YOUR_RUNNER_TOKEN` with your values.

#### Step 4: Start the Runner

1. Start the runner:
   ```
   .\run.cmd
   ```

### Workflow Configuration

The deploy workflow is defined in `.github/workflows/publish.yml`. It runs the following steps:

1. Checkout the repository
2. Install Node.js
3. Install dependencies
4. Deploy the project

The workflow is triggered by pushing to the main branch.

### Monitoring

Once the runner is started, you can monitor it in the GitHub Actions tab of your repository.

### Troubleshooting

- If the runner fails to start, check the PowerShell output
- Verify the URL and token are correct
- Restart the runner if needed       
