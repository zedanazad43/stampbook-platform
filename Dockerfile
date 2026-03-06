FROM node:18

WORKDIR /app

COPY package*.json ./

# Install dependencies; if NPM_TOKEN is provided via BuildKit secret, configure
# npm authentication first so private packages can be resolved, then clean up.
# Usage: docker build --secret id=npm_token,env=NPM_TOKEN .
RUN --mount=type=cache,id=npm,target=/root/.npm \
    --mount=type=secret,id=npm_token,required=false \
    if [ -f /run/secrets/npm_token ] && [ -s /run/secrets/npm_token ]; then \
      echo "//registry.npmjs.org/:_authToken=$(cat /run/secrets/npm_token)" > ~/.npmrc; \
    fi && \
    npm install && \
    rm -f ~/.npmrc

COPY . .

COPY .docker-healthcheck.sh /app/.docker-healthcheck.sh

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD ["/bin/bash", "/app/.docker-healthcheck.sh"]

EXPOSE 8080
CMD ["node", "server.js"]