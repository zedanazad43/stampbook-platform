# Multi-stage build for Stampcoin Platform

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies
RUN npm ci

# Copy application files
COPY . .

# Build application
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/public ./public
COPY server.js wallet.js market.js utils.py ./

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Set Render outbound IP addresses
# These IPs are shared across services in the same region
ENV RENDER_OUTBOUND_IPS="74.220.48.0/24 74.220.56.0/24"

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Add startup script for Render
COPY render-startup.sh /app/render-startup.sh
RUN chmod +x /app/render-startup.sh

# Start application using Render-specific startup script
CMD ["/app/render-startup.sh"]
