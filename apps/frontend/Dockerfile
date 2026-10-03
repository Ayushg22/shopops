# Stage 1: Build stage
FROM node:20-slim AS builder

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build -w @shopops/frontend

# Stage 2: Production Nginx web server
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
