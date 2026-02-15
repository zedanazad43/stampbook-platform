# Deployment Guide | دليل النشر | Bereitstellungshandbuch

This document provides comprehensive deployment instructions for the Stampcoin Platform, covering GitHub Pages (static frontend) and various cloud platforms for the Node.js backend API.

## Table of Contents

<<<<<<< HEAD
يغطي هذا الدليل جميع خيارات النشر لمنصة Stampcoin بما في ذلك Docker و GitHub Pages والمنصات السحابية.

---

## Table of Contents / جدول المحتويات

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [GitHub Actions CI/CD](#github-actions-cicd)
4. [GitHub Pages Deployment](#github-pages-deployment)
5. [Cloud Platform Deployment](#cloud-platform-deployment)
6. [Environment Variables](#environment-variables)

---

## Local Development

### Prerequisites / المتطلبات الأساسية

- Node.js >= 16.x
- npm or yarn
- Git

### Installation / التثبيت

```bash
# Clone the repository
git clone https://github.com/zedanazad43/stp.git
cd stp

# Install dependencies
npm install

# Start the development server
npm run dev
```

The server will start on `http://localhost:8080`

---

## Docker Deployment

### Build Docker Image / بناء صورة Docker

```bash
# Build the Docker image
docker build -t stampcoin-platform .

# Or use npm script
npm run docker:build
```

### Run Docker Container / تشغيل حاوية Docker

```bash
# Run the container on port 8080
docker run -d -p 8080:8080 --name stampcoin stampcoin-platform

# Or use npm script
npm run docker:run
```

### Docker Compose (Optional)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  stampcoin:
    build: .
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - SYNC_TOKEN=${SYNC_TOKEN}
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

### Verify Docker Deployment / التحقق من نشر Docker

```bash
# Check container status
docker ps

# Check logs
docker logs stampcoin

# Test the API
curl http://localhost:8080/api/market/items
curl http://localhost:8080/api/wallets
```

---

## GitHub Actions CI/CD

The repository includes automated workflows for building and deploying:

### 1. Build and Push Workflow

**File**: `.github/workflows/build-and-test.yml`

**Triggers**: Pushes to `main` and `develop` branches, PRs to `main`

**Actions**:
- Runs tests and linting
- Builds Docker image
- Pushes to GitHub Container Registry (ghcr.io)
- Deploys to Render (on push to main)

**Usage**:
```bash
# The workflow runs automatically on push to main or develop
git push origin main
git push origin develop
```

**Access the image**:
```bash
docker pull ghcr.io/zedanazad43/stampcoin-platform:latest
```

### 2. Render Deployment Configuration

**File**: `render.yaml`

This file defines the service configuration for Render deployment.

**Features**:
- Node.js runtime environment
- Docker-based deployment
- Health checks
- Environment variables configuration

**Manual Deployment**:
1. Create a Render account at [https://render.com/](https://render.com/)
2. Connect your GitHub repository to Render
3. Create a new Web Service from your repository
4. The service will use the `render.yaml` configuration

**Environment Variables**:
- `NODE_ENV`: Set to "production"
- `PORT`: Render uses port 10000 by default
- `SYNC_TOKEN`: Required for authentication in production

### 2. GitHub Pages Deployment

**File**: `.github/workflows/deploy.yml`

**Triggers**: Pushes to `main` branch

**Actions**:
- Builds static site
- Deploys to GitHub Pages
- Available at: `https://zedanazad43.github.io/stp/`

### 3. Pages Configuration

**File**: `.github/workflows/pages.yml`

Additional GitHub Pages configuration for static content.
=======
- [GitHub Pages Deployment (Static Site)](#github-pages-deployment)
- [Backend API Deployment Options](#backend-api-deployment-options)
  - [Railway](#railway)
  - [Render](#render)
  - [Heroku](#heroku)
  - [Vercel](#vercel)
  - [Fly.io](#flyio)
>>>>>>> a4f0e2ee76d23aa5eaf9d56063365761bc958a18

---

## GitHub Pages Deployment

The static landing page is automatically deployed to GitHub Pages when you push to the `main` branch.

### Prerequisites

- GitHub repository with proper permissions
- GitHub Actions enabled

### Setup Steps

1. **Enable GitHub Pages in Repository Settings**
   
   Navigate to your repository on GitHub:
   ```
   Settings → Pages → Source
   ```
   - **Source**: GitHub Actions
   - The site will be available at: `https://zedanazad43.github.io/stp/`

2. **Automatic Deployment**
   
   The `.github/workflows/deploy.yml` workflow automatically:
   - Installs dependencies with npm caching
   - Builds the static site
   - Uploads the `public/` directory as a Pages artifact
   - Deploys to GitHub Pages

3. **Manual Trigger** (if needed)
   
   Go to `Actions` tab → Select `Deploy to GitHub Pages` → `Run workflow`

### Custom Domain Configuration

To use a custom domain:

1. Add a `CNAME` file to the `public/` directory:
   ```
   echo "your-domain.com" > public/CNAME
   ```

2. Configure DNS records at your domain registrar:
   ```
   Type: CNAME
   Name: www (or @)
   Value: zedanazad43.github.io
   ```

3. In GitHub Settings → Pages, enter your custom domain

### Verification

After deployment, verify the site is live:
- Main site: https://zedanazad43.github.io/stp/
- Check deployment status: Actions tab in GitHub

---

## Backend API Deployment Options

The Node.js backend (`server.js`) provides REST API endpoints for stamp synchronization. Choose one of the following platforms:

---

### Railway

Railway offers simple deployment with automatic HTTPS and environment variable management.

#### Prerequisites
- Railway account (https://railway.app)
- Railway CLI (optional): `npm install -g @railway/cli`

#### Deployment Steps

**Option 1: Web Dashboard**

1. Login to Railway and create a new project
2. Select "Deploy from GitHub repo"
3. Choose the `zedanazad43/stp` repository
4. Railway auto-detects the Node.js app

**Option 2: Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### Environment Variables

<<<<<<< HEAD
1. Create account at [Render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `npm ci`
   - **Start Command**: `node server.js`
   - **Environment**: Node
   - **Port**: 10000 (Render default)

Alternatively, you can use the `render.yaml` file for automated configuration:
1. Create a new Web Service
2. Select "Configure with render.yaml"
3. The service will automatically use the configuration in the repository
=======
In Railway dashboard → Variables tab, add:

```
SYNC_TOKEN=your-secret-token-here
PORT=8080
```

#### Monitoring

- View logs: Railway dashboard → Deployments → Logs
- Metrics: Dashboard shows CPU, memory, and network usage
- Domain: Railway provides a free `.railway.app` domain

#### Cost
- Free tier: $5 credit/month
- Pay-as-you-go: ~$5-10/month for small apps

---

### Render

Render provides free hosting with automatic deploys from GitHub.

#### Prerequisites
- Render account (https://render.com)

#### Deployment Steps

1. **Create New Web Service**
   - Dashboard → New → Web Service
   - Connect your GitHub repository
   - Select `zedanazad43/stp`

2. **Configure Service**
   ```
   Name: stampcoin-api
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables**
   
   In the service settings:
   ```
   SYNC_TOKEN=your-secret-token-here
   PORT=8080
   ```

4. **Deploy**
   
   Render automatically builds and deploys. The service will be available at:
   ```
   https://stampcoin-api.onrender.com
   ```

#### Auto-Deploy from GitHub

Render automatically redeploys when you push to the main branch.

#### Monitoring

- Logs: Service dashboard → Logs tab
- Metrics: Dashboard shows request metrics
- Health checks: Configure under Settings → Health & Alerts

#### Cost
- Free tier: Available (sleeps after 15 min inactivity)
- Starter: $7/month (always on)

---
>>>>>>> a4f0e2ee76d23aa5eaf9d56063365761bc958a18

### Heroku

Heroku is a mature platform with extensive add-on ecosystem.

#### Prerequisites
- Heroku account (https://heroku.com)
- Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

#### Deployment Steps

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Ubuntu
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create stampcoin-platform
   ```

3. **Create Procfile**
   
   Create `Procfile` in repository root:
   ```
   web: node server.js
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set SYNC_TOKEN=your-secret-token-here
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **View App**
   ```bash
   heroku open
   heroku logs --tail
   ```

#### Data Persistence

Since `data.json` is stored locally, use Heroku Postgres or Redis add-on for persistence:

```bash
heroku addons:create heroku-postgresql:mini
```

Then modify `server.js` to use the database instead of `data.json`.

#### Monitoring

```bash
# View logs
heroku logs --tail

# Check app status
heroku ps

# Access dashboard
heroku dashboard
```

#### Cost
- Eco Dynos: $5/month (basic tier, may sleep)
- Basic Dynos: $7/month (no sleeping)

---

### Vercel

Vercel specializes in serverless deployments and is excellent for API routes.

#### Prerequisites
- Vercel account (https://vercel.com)
- Vercel CLI (optional): `npm install -g vercel`

#### Deployment Steps

**Option 1: GitHub Integration**

1. Login to Vercel and import your GitHub repository
2. Vercel auto-detects the project settings
3. Deploy with one click

**Option 2: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

#### Serverless Configuration

Create `vercel.json` in repository root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/sync",
      "dest": "server.js"
    }
  ]
}
```

#### Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
SYNC_TOKEN=your-secret-token-here
```

**Note**: Vercel is serverless, so `data.json` persistence won't work. Use Vercel KV, PostgreSQL, or external storage.

#### Monitoring

- Deployment logs: Vercel dashboard
- Real-time logs: `vercel logs`
- Analytics: Available in dashboard (Pro plan)

#### Cost
- Hobby: Free (personal projects)
- Pro: $20/month (commercial use)

---

### Fly.io

Fly.io runs apps close to users globally with full VM control.

#### Prerequisites
- Fly.io account (https://fly.io)
- Fly CLI: `curl -L https://fly.io/install.sh | sh`

#### Deployment Steps

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Initialize App**
   ```bash
   fly launch
   ```
   
   This creates `fly.toml` configuration file.

4. **Configure `fly.toml`**
   
   Edit the generated file:
   ```toml
   app = "stampcoin-platform"
   primary_region = "iad"

   [build]
     builder = "heroku/buildpacks:20"

   [env]
     PORT = "8080"

   [http_service]
     internal_port = 8080
     force_https = true
     auto_stop_machines = true
     auto_start_machines = true

   [[services]]
     protocol = "tcp"
     internal_port = 8080

     [[services.ports]]
       port = 80
       handlers = ["http"]

     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]
   ```

5. **Set Secrets**
   ```bash
   fly secrets set SYNC_TOKEN=your-secret-token-here
   ```

6. **Deploy**
   ```bash
   fly deploy
   ```

7. **Access App**
   ```bash
   fly open
   ```

#### Volume for Data Persistence

To persist `data.json`:

```bash
# Create volume
fly volumes create stampcoin_data --size 1

# Update fly.toml to mount volume
# Add to fly.toml:
[[mounts]]
  source = "stampcoin_data"
  destination = "/app/data"
```

Update `server.js` to use `/app/data/data.json` instead of `./data.json`.

#### Monitoring

```bash
# View logs
fly logs

# Check status
fly status

# Open dashboard
fly dashboard
```

#### Cost
- Free tier: 3 shared VMs, 3GB storage
- Paid: ~$2-5/month for basic VM

---

## Comparison Table

| Platform | Ease of Setup | Free Tier | Persistence | Best For |
|----------|--------------|-----------|-------------|----------|
| **GitHub Pages** | ⭐⭐⭐⭐⭐ | ✅ Unlimited | N/A (static) | Static site |
| **Railway** | ⭐⭐⭐⭐⭐ | $5 credit/month | ✅ | Quick deploy |
| **Render** | ⭐⭐⭐⭐ | ✅ (sleeps) | ✅ | Free backend |
| **Heroku** | ⭐⭐⭐ | ❌ (paid only) | ✅ | Mature ecosystem |
| **Vercel** | ⭐⭐⭐⭐ | ✅ | ❌ (serverless) | Edge compute |
| **Fly.io** | ⭐⭐⭐ | ✅ (limited) | ✅ | Global deploy |

---

## Recommendations

### For Production

1. **Static Site**: GitHub Pages (free, reliable)
2. **Backend API**: Railway or Fly.io (persistent storage, good performance)
3. **Database**: Add PostgreSQL for production-grade data storage

### For Development/Testing

1. **Static Site**: GitHub Pages
2. **Backend API**: Render (free tier)

### For Scale

1. **Static Site**: GitHub Pages + CDN
2. **Backend API**: Fly.io (global edge deployment)
3. **Database**: Managed PostgreSQL (Supabase, Neon, or platform-specific)

---

## Post-Deployment Checklist

- [ ] Verify GitHub Pages site is accessible
- [ ] Test API endpoints with curl/Postman
- [ ] Confirm environment variables are set correctly
- [ ] Check logs for errors
- [ ] Set up monitoring/alerts
- [ ] Configure custom domain (optional)
- [ ] Enable HTTPS (automatic on most platforms)
- [ ] Set up automated backups for data.json
- [ ] Review security settings (CORS, rate limiting)
- [ ] Document the deployed URLs in README.md

---

## Troubleshooting

### GitHub Pages 404 Error
- Check Actions tab for deployment failures
- Verify Pages is enabled in repository settings
- Ensure `public/` directory exists with `index.html`

### Backend API Not Responding
- Check environment variables are set
- Review application logs
- Verify PORT is correctly configured
- Test with: `curl -X GET <your-api-url>/sync -H "Authorization: Bearer <token>"`

### CORS Issues
- Ensure `cors` middleware is enabled in `server.js`
- Check allowed origins in CORS configuration

### Data Loss
- Implement database instead of `data.json` for production
- Set up regular backups
- Use platform-specific persistent storage (volumes/disks)

---

## Support

For deployment issues:
- GitHub Pages: https://docs.github.com/pages
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- Heroku: https://devcenter.heroku.com
- Vercel: https://vercel.com/docs
- Fly.io: https://fly.io/docs

For application-specific issues, open an issue at:
https://github.com/zedanazad43/stp/issues
