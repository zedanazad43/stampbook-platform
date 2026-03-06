FROM node:18

WORKDIR /app

COPY package*.json ./

# Use BuildKit mounts for npm cache and secret token, then clean .npmrc
RUN --mount=type=secret,id=npm_token,required=false \
    --mount=type=cache,id=npm-cache,target=/root/.npm \
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