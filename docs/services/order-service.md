# Service Documentation: Order Service (`@shopops/order-service`)

## 1. Overview
The Order Service handles order intake, line-item pricing, order lifecycle state changes, and saga orchestration triggers.

- **Port**: 8003
- **Directory**: `services/order-service/`
- **Database**: PostgreSQL `shopops_order`
- **Container Name**: `shopops-order-service`
- **Events Emitted**: `order.created`
- **Events Consumed**: `payment.completed`, `inventory.insufficient`, `payment.failed`

---

## 2. Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Listening HTTP port | `8003` |
| `NODE_ENV` | Runtime mode | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://shopops:secret@postgres:5432/shopops_order?schema=public` |
| `RABBITMQ_URL` | AMQP broker connection | `amqp://guest:guest@rabbitmq:5672` |
| `LOG_LEVEL` | Logging level | `info` |

---

## 3. Endpoints

- `POST /api/v1/orders`: Create new order. Returns `201 Accepted` with status `PENDING`.
- `GET /api/v1/orders/:id`: Query order status and details.
- `GET /api/v1/orders/customer/:customerId`: Retrieve customer order history.
- `GET /health/live`, `GET /health/ready`: Probes.
