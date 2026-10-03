# Service Documentation: Catalog Service (`@shopops/catalog-service`)

## 1. Overview
The Catalog Service manages products, inventory categories, pricing metadata, and product search.

- **Port**: 8002
- **Directory**: `services/catalog-service/`
- **Database**: PostgreSQL `shopops_catalog`
- **Container Name**: `shopops-catalog-service`

---

## 2. Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Listening HTTP port | `8002` |
| `NODE_ENV` | Runtime mode | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://shopops:secret@postgres:5432/shopops_catalog?schema=public` |
| `LOG_LEVEL` | Logging level | `info` |

---

## 3. Endpoints

- `GET /api/v1/products`: List products (supports `page`, `limit`, `category`).
- `GET /api/v1/products/:id`: Get product details.
- `POST /api/v1/products`: Create a new product.
- `GET /health/live`, `GET /health/ready`: Probes.
