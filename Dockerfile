FROM node:18

WORKDIR /app

COPY package*.json ./

# Install dependencies; if NPM_TOKEN is provided via BuildKit secret, configure
# npm authentication first so private packages can be resolved, then clean up.
# The npm cache is persisted across builds via a BuildKit cache mount.
# Usage: docker build --secret id=npm_token,env=NPM_TOKEN .
RUN --mount=type=secret,id=npm_token,required=false \
    --mount=type=cache,id=npm-cache,target=/root/.npm \
    if [ -f /run/secrets/npm_token ] && [ -s /run/secrets/npm_token ]; then \
      echo "//registry.npmjs.org/:_authToken=$(cat /run/secrets/npm_token)" > ~/.npmrc; \
    fi && \
    npm ci)

COPY . .

EXPOSE 10000
CMD ["node", "server.js"]
