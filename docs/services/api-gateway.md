# Service Documentation: API Gateway (`@shopops/api-gateway`)

## 1. Overview
The API Gateway is the public reverse-proxy ingress point for the ShopOps platform. It routes external traffic to backend microservices, validates authorization credentials, tracks distributed correlation IDs, and formats client error envelopes.

- **Port**: 8000
- **Directory**: `services/api-gateway/`
- **Container Name**: `shopops-api-gateway`
- **Base Image**: `node:20-slim` (Non-root user: `node`)

---

## 2. Environment Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT_API_GATEWAY` | Internal HTTP listening port | `8000` |
| `NODE_ENV` | Runtime environment mode | `production` / `development` |
| `LOG_LEVEL` | Logging verbosity | `info` / `debug` |
| `AUTH_SERVICE_URL` | Upstream URL for Auth Service | `http://auth-service:8001` |
| `CATALOG_SERVICE_URL` | Upstream URL for Catalog Service | `http://catalog-service:8002` |
| `ORDER_SERVICE_URL` | Upstream URL for Order Service | `http://order-service:8003` |
| `INVENTORY_SERVICE_URL` | Upstream URL for Inventory Service | `http://inventory-service:8004` |
| `PAYMENT_SERVICE_URL` | Upstream URL for Payment Service | `http://payment-service:8005` |
| `NOTIFICATION_SERVICE_URL` | Upstream URL for Notification Service | `http://notification-service:8006` |

---

## 3. Upstream Routing Matrix

| Route Path | Upstream Target | Auth Requirement |
| :--- | :--- | :--- |
| `/api/v1/auth/*` | `AUTH_SERVICE_URL` (`:8001`) | Public (`/register`, `/login`), Bearer (`/me`) |
| `/api/v1/products/*` | `CATALOG_SERVICE_URL` (`:8002`) | Public (Read), Admin (Write) |
| `/api/v1/orders/*` | `ORDER_SERVICE_URL` (`:8003`) | Public / Bearer |
| `/api/v1/inventory/*` | `INVENTORY_SERVICE_URL` (`:8004`) | Internal / Public Read |
| `/api/v1/payments/*` | `PAYMENT_SERVICE_URL` (`:8005`) | Internal / Public Read |
| `/api/v1/notifications/*` | `NOTIFICATION_SERVICE_URL` (`:8006`) | Public / Bearer |

---

## 4. Health Checks
- **Liveness Probe**: `GET http://localhost:8000/health/live` ➔ Returns `{"status":"UP"}`
- **Readiness Probe**: `GET http://localhost:8000/health/ready` ➔ Returns `{"status":"UP"}`
