# Stage 1: Build stage
FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY . .

RUN npm ci
RUN npx prisma generate --schema=services/payment-service/prisma/schema.prisma
RUN npm run build -w @shopops/config && \
    npm run build -w @shopops/logger && \
    npm run build -w @shopops/shared-types && \
    npm run build -w @shopops/observability && \
    npm run build -w @shopops/payment-service

# Stage 2: Production runtime stage
FROM node:20-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

USER node

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/packages ./packages
COPY --from=builder --chown=node:node /app/services/payment-service/dist ./services/payment-service/dist
COPY --from=builder --chown=node:node /app/services/payment-service/package.json ./services/payment-service/package.json

EXPOSE 8005

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8005/health/live || exit 1

CMD ["node", "services/payment-service/dist/app.js"]
