# ShopOps: Distributed System Architecture Overview

## 1. Executive Summary
ShopOps is an enterprise-grade cloud-native e-commerce platform engineered specifically to serve as a real-world SRE, Chaos Engineering, and AIOps testbed. It pairs a complete customer-facing microservices e-commerce workflow with an enterprise observability and telemetry backbone.

```
                                  +-----------------------+
                                  | React SPA (Port 8080) |
                                  |     (Nginx Alpine)    |
                                  +-----------+-----------+
                                              |
                                              | HTTPS / REST
                                              v
                             +---------------------------------+
                             |     API Gateway (Port 8000)     |
                             |   JWT Auth | Proxy | Tracing    |
                             +----------------+----------------+
                                              |
     +-----------------+----------------------+-------------------+-------------------+
     |                 |                      |                   |                   |
     v                 v                      v                   v                   v
+----------+     +-----------+          +-----------+       +-----------+       +-----------+
|   Auth   |     |  Catalog  |          |   Order   |       | Inventory |       |  Payment  |
| Service  |     |  Service  |          |  Service  |       |  Service  |       |  Service  |
|  (8001)  |     |   (8002)  |          |   (8003)  |       |   (8004)  |       |   (8005)  |
+----+-----+     +-----+-----+          +-----+-----+       +-----+-----+       +-----+-----+
     |                 |                      |                   |                   |
     v                 v                      v                   v                   v
[PostgreSQL]      [PostgreSQL]           [PostgreSQL]        [PostgreSQL]        [PostgreSQL]
(shopops_auth)  (shopops_catalog)       (shopops_order)   (shopops_inventory)  (shopops_payment)
                                              |                   ^                   ^
                                              | order.created     | order.created     | inventory.reserved
                                              v                   |                   |
                                        +-----+-------------------+-------------------+-----+
                                        |                   RabbitMQ 3.13                   |
                                        |             Topic Exchange: shopops.events        |
                                        +-------------------------+-------------------------+
                                                                  |
                                                                  | all events (*.#)
                                                                  v
                                                     +--------------------------+
                                                     |   Notification Service   |
                                                     |          (8006)          |
                                                     +------------+-------------+
                                                                  |
                                                                  v
                                                           [Redis (Cache)]
```

---

## 2. Platform Core Pillars

### 2.1 Domain Separation & Polyglot Storage
- **Isolated State**: Each microservice strictly encapsulates its domain model. Direct cross-database access is prohibited.
- **PostgreSQL 16**: Relational storage for transactions, inventory stock integrity, order histories, and user credentials across isolated logical databases.
- **Redis 7.2**: In-memory store for high-speed customer notification queues and transient session caches.
- **RabbitMQ 3.13**: AMQP topic broker handling asynchronous saga orchestration and decoupling high-traffic mutations.

### 2.2 Ingress & Client Gateway
- **Single Ingress Point**: All external traffic routes through the API Gateway (port 8000) or Frontend SPA proxy (port 8080).
- **Security & Correlation**: The Gateway validates Bearer JWT tokens, extracts claims (`userId`, `role`), generates or preserves distributed correlation IDs (`x-correlation-id`), and proxies requests to downstream services.

### 2.3 Distributed Observability Pipeline
- **OpenTelemetry SDK**: Embedded inside every service to intercept HTTP requests, database transactions, and message publishing.
- **Unified Telemetry Backbone**:
  - **OTel Collector**: Central ingestion point for metrics, traces, and logs.
  - **Grafana Tempo**: Distributed tracing engine capturing complete end-to-end spans.
  - **Prometheus**: Time-series metrics collection scraping `/metrics` endpoints.
  - **Grafana Loki**: Log aggregation with correlation ID label indexing.
  - **Grafana**: Visual operational dashboards connecting metrics, logs, and traces.
  - **Alertmanager**: SLO breach evaluation and incident notification routing.

---

## 3. Communication Protocols

| Interaction | Protocol | Transport | Pattern | Error Handling |
| :--- | :--- | :--- | :--- | :--- |
| Client ➔ Gateway | HTTP/REST | TCP/JSON | Request-Response | Standard HTTP Status Codes (400, 401, 404, 500) |
| Gateway ➔ Services | HTTP/REST | Docker Internal DNS | Reverse Proxy (`http-proxy-middleware`) | Downstream timeouts return 504 Gateway Timeout |
| Order ➔ Inventory ➔ Payment | AMQP 0-9-1 | RabbitMQ TCP | Choreographed Distributed Saga | Retries with exponential backoff ➔ Dead-Letter Exchange (`shopops.events.dlx`) |
| Notifications | AMQP / Redis | RabbitMQ ➔ Redis | Pub-Sub / List Push | Transient worker retries, persistent DLQ |

---

## 4. Container & Runtime Specifications
- **Base Images**: Minimal `node:20-slim` for microservices; `nginx:alpine` for frontend SPA.
- **Security Context**: All microservice containers run strictly as unprivileged user `node` (UID: 1000).
- **Resource Constraints**: Defined in Docker Compose and Kubernetes manifests (0.5 CPU, 256MB RAM per microservice).
- **Health Probes**: Built-in HTTP health probes on `/health/live` and `/health/ready` evaluated every 10 seconds.
