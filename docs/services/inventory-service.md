# Service Documentation: Inventory Service (`@shopops/inventory-service`)

## 1. Overview
The Inventory Service maintains physical and available stock counts, creates stock reservations upon order intake, and prevents overselling through atomic stock deduction.

- **Port**: 8004
- **Directory**: `services/inventory-service/`
- **Database**: PostgreSQL `shopops_inventory`
- **Container Name**: `shopops-inventory-service`
- **Events Consumed**: `order.created`
- **Events Emitted**: `inventory.reserved`, `inventory.insufficient`

---

## 2. Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Listening HTTP port | `8004` |
| `NODE_ENV` | Runtime mode | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://shopops:secret@postgres:5432/shopops_inventory?schema=public` |
| `RABBITMQ_URL` | AMQP broker connection | `amqp://guest:guest@rabbitmq:5672` |
| `LOG_LEVEL` | Logging level | `info` |

---

## 3. Endpoints

- `GET /api/v1/inventory/:productId`: Query stock levels (`availableQuantity`, `reservedQuantity`).
- `POST /api/v1/inventory/seed`: Seed stock for a given SKU.
- `GET /health/live`, `GET /health/ready`: Probes.
