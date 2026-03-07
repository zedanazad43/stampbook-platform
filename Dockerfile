FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install production dependencies only.
# If NPM_TOKEN is provided via BuildKit secret, configure npm auth first, then clean up.
# Usage: docker build --secret id=npm_token,env=NPM_TOKEN .
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    --mount=type=secret,id=npm_token,required=false \
    (trap 'rm -f ~/.npmrc' EXIT; \
    if [ -f /run/secrets/npm_token ] && [ -s /run/secrets/npm_token ]; then \
      echo "//registry.npmjs.org/:_authToken=$(cat /run/secrets/npm_token)" > ~/.npmrc; \
    fi && \
    npm ci --omit=dev)

COPY . .

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["node", "server.js"]
