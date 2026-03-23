# Hybrid Deployment for ecostamp.net (Local + Cloud)

This guide sets up high-availability routing through Cloudflare so service continues even when your local computer is offline.

## Target Architecture

- Public domain: `ecostamp.net`
- Cloud origin (always-on baseline): Render web service
- Local origin (your computer): Docker + Caddy stack from `SELF_HOSTING.md`
- Traffic control: Cloudflare in front of both origins

## Important Reality Check

Automatic health-based failover at Cloudflare DNS level requires **Cloudflare Load Balancing** (paid add-on).

- With Load Balancing: automatic origin health checks and failover are supported.
- Without Load Balancing: use one active origin at a time, or do manual switch/failover.

## Step 1: Deploy Cloud Origin (Render)

1. Create a Render web service from this repository.
2. Use `render.yaml` and set environment values from `.env.cloud.example`.
3. Verify cloud health endpoint works:
   - `https://YOUR_RENDER_HOST/health`

Recommended origin name in this document: `origin-cloud.ecostamp.net`.

## Step 2: Deploy Local Origin (Your PC)

1. Follow `SELF_HOSTING.md` to run local stack.
2. Configure `.env.selfhost` using `.env.selfhost.example`.
3. Verify local endpoint from LAN first:
   - `https://ecostamp.net/health`

Recommended origin name in this document: `origin-local.ecostamp.net`.

## Step 3: Configure Cloudflare DNS

Create DNS records in Cloudflare:

1. `origin-cloud.ecostamp.net`
   - Type: `CNAME`
   - Target: your Render host (for example `stampcoin-platform.onrender.com`)
   - Proxy status: DNS only during initial validation, then proxied if needed

2. `origin-local.ecostamp.net`
   - Option A (preferred): expose through Cloudflare Tunnel on your computer
   - Option B: point to home public IP (`A` record) if ports are open

3. `ecostamp.net`
   - Will be attached to Cloudflare Load Balancer hostname (paid path)
   - Or pointed manually to one origin (free path)

## Step 4A: Paid Path (Recommended) - Cloudflare Load Balancing

1. Cloudflare Load Balancer:
   - Hostname: `ecostamp.net`
   - Monitor path: `/health`
   - Expected response: HTTP 200

2. Pool `pool-cloud-primary`:
   - Origin: `origin-cloud.ecostamp.net`
   - Mark as primary

3. Pool `pool-local-secondary`:
   - Origin: `origin-local.ecostamp.net`
   - Mark as fallback

4. Enable session affinity only if you need sticky behavior.

Result: when local PC is down, cloud continues serving automatically.

## Step 4B: Free Path (No Paid LB)

Use one active origin and keep the other as standby:

1. Point `ecostamp.net` to `origin-cloud.ecostamp.net` for always-on production.
2. Keep `origin-local.ecostamp.net` available for testing or emergency switch.
3. If needed, switch `ecostamp.net` CNAME manually to local origin.

This is free but failover is manual, not automatic.

## Keeping Name and Domain Aligned

If you want app name and domain to match, use:

- Product/app name: `EcoStamp`
- Main domain: `ecostamp.net`
- API base URL: `https://ecostamp.net`

For free auxiliary endpoints, you can use Cloudflare-provided subdomains or service hostnames, but public branding should stay on `ecostamp.net`.

## Optional: Cloudflare Tunnel for Local Origin

Using a tunnel avoids exposing home router ports directly.

1. Install `cloudflared` on your computer.
2. Authenticate and create tunnel.
3. Route `origin-local.ecostamp.net` to local Caddy (`https://localhost:443`).
4. Keep tunnel service running as Windows service.

## Verification Checklist

1. `https://origin-cloud.ecostamp.net/health` responds 200.
2. `https://origin-local.ecostamp.net/health` responds 200.
3. `https://ecostamp.net/health` responds 200.
4. `https://ecostamp.net/api/site` shows expected `canonicalHost` and `baseUrl`.

## Operations

- Local deploy: `deploy-local.cmd`
- Local stop: `stop-local.cmd`
- Local logs: `logs-local.cmd`
- Cloud deploy: Render auto-deploy or manual redeploy from dashboard
