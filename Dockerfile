FROM node:18

WORKDIR /app

COPY package*.json ./

# Use BuildKit mounts for npm cache and secret token, then clean .npmrc
RUN --mount=type=secret,id=npm_token,required=false \
    --mount=type=cache,id=npm-cache,target=/root/.npm \
    if [ -f /run/secrets/npm_token ] && [ -s /run/secrets/npm_token ]; then \
      echo "//registry.npmjs.org/:_authToken=$(cat /run/secrets/npm_token)" > ~/.npmrc; \
    fi && \
    npm ci)

COPY . .

EXPOSE 10000
CMD ["node", "server.js"]
