# Service Documentation: Notification Service (`@shopops/notification-service`)

## 1. Overview
The Notification Service is an event-driven worker that consumes all domain events across the platform topic exchange (`shopops.events`), formats user-facing alerts, and stores them in Redis lists for customer inbox retrieval.

- **Port**: 8006
- **Directory**: `services/notification-service/`
- **Storage**: Redis 7.2 (`redis://redis:6379`)
- **Container Name**: `shopops-notification-service`
- **Events Consumed**: `*.*` (All topic exchange events)

---

## 2. Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Listening HTTP port | `8006` |
| `NODE_ENV` | Runtime mode | `production` |
| `REDIS_URL` | Redis cache connection string | `redis://redis:6379` |
| `RABBITMQ_URL` | AMQP broker connection | `amqp://guest:guest@rabbitmq:5672` |
| `LOG_LEVEL` | Logging level | `info` |

---

## 3. Endpoints

- `GET /api/v1/notifications/:customerId`: Retrieve list of notifications for customer.
- `GET /health/live`, `GET /health/ready`: Probes.
