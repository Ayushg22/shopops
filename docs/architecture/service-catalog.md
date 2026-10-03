# Service Catalog

| Service | Port | Database | Primary Responsibility |
|---|---|---|---|
| `api-gateway` | 8000 | No | Routing, rate limiting, token validation |
| `auth-service` | 8001 | PostgreSQL | User accounts, credentials, JWT issuance |
| `catalog-service` | 8002 | PostgreSQL | Product catalogue, metadata, categories |
| `order-service` | 8003 | PostgreSQL | Order lifecycle and state management |
| `inventory-service` | 8004 | PostgreSQL | Stock tracking and reservations |
| `payment-service` | 8005 | PostgreSQL | Payment processing simulation |
| `notification-service` | 8006 | No | Async alerts, email, order updates |
