# Stage 1: Build stage
FROM node:20-slim AS builder

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build -w @shopops/config && \
    npm run build -w @shopops/logger && \
    npm run build -w @shopops/shared-types && \
    npm run build -w @shopops/observability && \
    npm run build -w @shopops/notification-service

# Stage 2: Production runtime stage
FROM node:20-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

USER node

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/packages ./packages
COPY --from=builder --chown=node:node /app/services/notification-service/dist ./services/notification-service/dist
COPY --from=builder --chown=node:node /app/services/notification-service/package.json ./services/notification-service/package.json

EXPOSE 8006

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8006/health/live || exit 1

CMD ["node", "services/notification-service/dist/app.js"]
