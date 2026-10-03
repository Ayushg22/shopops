# Service Documentation: Payment Service (`@shopops/payment-service`)

## 1. Overview
The Payment Service emulates payment gateway transactions, handles charge authorizations, creates transaction references, and emits payment results to advance the distributed saga.

- **Port**: 8005
- **Directory**: `services/payment-service/`
- **Database**: PostgreSQL `shopops_payment`
- **Container Name**: `shopops-payment-service`
- **Events Consumed**: `inventory.reserved`
- **Events Emitted**: `payment.completed`, `payment.failed`

---

## 2. Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Listening HTTP port | `8005` |
| `NODE_ENV` | Runtime mode | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://shopops:secret@postgres:5432/shopops_payment?schema=public` |
| `RABBITMQ_URL` | AMQP broker connection | `amqp://guest:guest@rabbitmq:5672` |
| `LOG_LEVEL` | Logging level | `info` |

---

## 3. Endpoints

- `GET /api/v1/payments/:orderId`: Query payment status and transaction reference.
- `GET /health/live`, `GET /health/ready`: Probes.
