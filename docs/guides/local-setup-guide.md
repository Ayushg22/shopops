# ShopOps: Local Environment Setup Guide

This guide walks through starting and testing the complete containerized ShopOps platform locally on Linux/macOS.

---

## 1. Prerequisites
- **Docker Engine**: Version 24+ or 29+ (`docker --version`)
- **Docker Compose**: Version v2.20+ (`docker compose version`)
- **Node.js**: Version 20 LTS (if running tests or local builds outside Docker)
- **Utilities**: `curl`, `jq`, `git`

---

## 2. Quick Start (All-in-One Docker Platform)

### Step 1: Clone Repository
```bash
git clone https://github.com/Ayushg22/shopops.git
cd shopops
```

### Step 2: Build & Start All 17 Containers
```bash
docker compose up -d --build
```
This builds and starts:
- 9 Infrastructure containers (Postgres, Redis, RabbitMQ, OTel Collector, Prometheus, Grafana, Loki, Tempo, Alertmanager)
- 7 Microservices (`auth`, `catalog`, `order`, `inventory`, `payment`, `notification`, `api-gateway`)
- 1 Frontend Web Application (`frontend` on port 8080)

### Step 3: Verify Container Health
```bash
docker compose ps
```
All containers should display status `healthy` or `running`.

---

## 3. Platform Port Matrix

| Service | Internal Port | External Port | URL |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | 80 | 8080 | http://localhost:8080 |
| **API Gateway** | 8000 | 8000 | http://localhost:8000 |
| **Auth Service** | 8001 | 8001 | http://localhost:8001 |
| **Catalog Service** | 8002 | 8002 | http://localhost:8002 |
| **Order Service** | 8003 | 8003 | http://localhost:8003 |
| **Inventory Service** | 8004 | 8004 | http://localhost:8004 |
| **Payment Service** | 8005 | 8005 | http://localhost:8005 |
| **Notification Service** | 8006 | 8006 | http://localhost:8006 |
| **PostgreSQL** | 5432 | 5432 | `localhost:5432` |
| **Redis** | 6379 | 6379 | `localhost:6379` |
| **RabbitMQ Management** | 15672 | 15672 | http://localhost:15672 (`guest`/`guest`) |
| **Prometheus UI** | 9090 | 9090 | http://localhost:9090 |
| **Grafana Dashboards**| 3000 | 3001 | http://localhost:3001 (`admin`/`admin`) |
| **Alertmanager UI** | 9093 | 9093 | http://localhost:9093 |
| **Loki Logs** | 3100 | 3100 | http://localhost:3100 |
| **Tempo Tracing** | 3200 | 3200 | http://localhost:3200 |

---

## 4. Automated E2E Verification
To verify the complete event-driven saga across all Docker containers, execute the automated verification script:
```bash
./scripts/local/test-weekend4-docker.sh
```
This script validates:
1. Health checks on all 8 application endpoints (`/health/live`, `/health`).
2. Seeding stock in `inventory-service` via API Gateway.
3. Placing a live order through API Gateway.
4. Asynchronous RabbitMQ cascade (`order.created` ➔ `inventory.reserved` ➔ `payment.completed` ➔ `order:COMPLETED`).
5. Customer notification delivery stored in Redis.

---

## 5. Teardown & Clean Reset
To stop all containers and retain data volumes:
```bash
docker compose down
```

To perform a clean slate reset (wipes all database volumes and local caches):
```bash
docker compose down -v
```
