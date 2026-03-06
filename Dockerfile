FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

COPY .docker-healthcheck.sh /app/.docker-healthcheck.sh

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD ["/bin/bash", "/app/.docker-healthcheck.sh"]

EXPOSE 8080
CMD ["node", "server.js"]