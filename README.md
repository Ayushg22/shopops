# ShopOps — Cloud-Native E-Commerce Platform

> **DevOps + Cloud + DevSecOps + GitOps + SRE + AIOps Portfolio Laboratory**

[![CI / Quality Checks](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/Ayushg22/shopops)
[![Architecture Standards](https://img.shields.io/badge/standards-v1.0-blue)](./SHOPOPS_ARCHITECTURE_ENGINEERING_STANDARDS.md)
[![Implementation Plan](https://img.shields.io/badge/plan-Weekend%204%20Complete-success)](./SHOPOPS_PROJECT_PLAN.md)

---

## 1. Project Overview

**ShopOps** is a production-grade, distributed microservices e-commerce platform built as an SRE and AIOps portfolio laboratory demonstrating:
- **Cloud Architecture**: Microsoft Azure & Azure Kubernetes Service (AKS)
- **Declarative Infrastructure**: Terraform (reusable modules, environment state)
- **CI / DevSecOps**: Jenkins (SonarQube SAST, Gitleaks secrets scanning, Trivy container scanning, Syft SBOM)
- **CD / GitOps**: Argo CD (App of Apps, declarative reconciliation, drift detection)
- **Containerization**: Multi-stage Docker builds (`node:20-slim`, `nginx:alpine`, non-root execution)
- **Package Management**: Helm charts with environment value overlays
- **Full-Stack Observability**: OpenTelemetry SDK/Collector, Prometheus, Alertmanager, Grafana, Loki, Tempo
- **SRE & Chaos Engineering**: SLOs, HPA/VPA autoscaling, k6 load testing, controlled chaos failure experiments
- **Controlled AIOps Remediation**: Custom TypeScript AI agent backed by an Azure-hosted LLM with tool calling, strict policy guardrails, automated post-remediation verification, and immutable audit logging

---

## 2. Architecture Map

```
                          +------------------------+
                          |   Internet / Client    |
                          +-----------+------------+
                                      |
                               Ingress Controller
                                      |
                          +-----------v------------+
                          |  apps/frontend (React) |
                          +-----------+------------+
                                      |
                         +------------v------------+
                         |  services/api-gateway   |
                         +------------+------------+
                                      |
       +---------------+--------------+--------------+---------------+
       |               |              |              |               |
       v               v              v              v               v
 [ auth-service ] [ catalog-service ] [ order-service ] [ inventory-service ] [ payment-service ]
       |               |              |              |               |
  PostgreSQL      PostgreSQL     PostgreSQL     PostgreSQL      PostgreSQL
  (shopops_auth) (shopops_catalog)(shopops_order)(shopops_inventory)(shopops_payment)
       |               |              |              |               |
       +---------------+--------------+--------------+---------------+
                                      |
                                   RabbitMQ (Exchange: shopops.events)
                                      |
                                      v
                          [ notification-service ]
                                      |
                                      v
                               [ Redis Cache ]
```

---

## 3. Implementation Progress

| Phase / Milestone | Status | Key Deliverables |
| :--- | :--- | :--- |
| **Weekend 1: Foundation & Observability** | ✅ Complete | Monorepo layout, Docker Compose infra (Postgres, Redis, RabbitMQ, Prometheus, Grafana, Loki, Tempo, OTel Collector) |
| **Weekend 2: Core Services** | ✅ Complete | Shared packages (`@shopops/config`, `@shopops/logger`, `@shopops/shared-types`), `auth-service`, `catalog-service`, `api-gateway` |
| **Weekend 3: Async Event Choreography** | ✅ Complete | RabbitMQ topic exchange, Saga orchestration (`order.created` ➔ `inventory.reserved` ➔ `payment.completed`), Redis notifications inbox |
| **Weekend 4: Docker Containerization** | ✅ Complete | Multi-stage Dockerfiles (`node:20-slim`), non-root `USER node`, container health probes, dynamic Nginx DNS resolution, full 17-container Docker Compose orchestration |
| **Weekend 5: Local Kubernetes (KinD/k3d)** | 🟡 Up Next | Namespaces, Deployments, Services, Ingress, ConfigMaps, Secrets, Probes, PDB, NetworkPolicies |
| **Weekend 6: Helm Packaging** | ⚪ Planned | Helm charts, values overlays, chart dependencies |
| **Weekend 7-8: Terraform & Azure AKS** | ⚪ Planned | Azure VNet, AKS, Postgres Flexible Server, Redis, ACR, Key Vault |

---

## 4. Engineering Documentation Index

The platform documentation is maintained in strict adherence to **Section 41 (ADRs)** and **Section 42 (Documentation Standards)** of [Architecture & Engineering Standards](./SHOPOPS_ARCHITECTURE_ENGINEERING_STANDARDS.md):

- 📖 **Master Documentation Index**: [docs/README.md](./docs/README.md)
- 🏛️ **Architecture Decision Records (ADRs)**: [docs/adr/](./docs/adr/)
  - [ADR-001: Overall System Architecture](./docs/adr/ADR-001-overall-system-architecture.md)
  - [ADR-002: Microservice Boundaries](./docs/adr/ADR-002-microservice-boundaries.md)
  - [ADR-003: PostgreSQL Logical Database Ownership](./docs/adr/ADR-003-postgresql-logical-database-ownership.md)
  - [ADR-004: REST vs Asynchronous Messaging](./docs/adr/ADR-004-rest-vs-asynchronous-messaging.md)
  - [ADR-005: RabbitMQ Event Strategy](./docs/adr/ADR-005-rabbitmq-event-strategy.md)
  - [ADR-006: Azure and AKS as Primary Cloud](./docs/adr/ADR-006-azure-and-aks-as-primary-cloud.md)
  - [ADR-007: Terraform as Infrastructure Source of Truth](./docs/adr/ADR-007-terraform-as-infrastructure-source-of-truth.md)
  - [ADR-008: Jenkins for Continuous Integration](./docs/adr/ADR-008-jenkins-for-ci.md)
  - [ADR-009: Argo CD for GitOps Continuous Delivery](./docs/adr/ADR-009-argo-cd-for-gitops-cd.md)
  - [ADR-010: OpenTelemetry-Based Observability](./docs/adr/ADR-010-opentelemetry-based-observability.md)
  - [ADR-011: Chaos Engineering Approach](./docs/adr/ADR-011-chaos-engineering-approach.md)
  - [ADR-012: AIOps Tool-Based Controlled Remediation](./docs/adr/ADR-012-aiops-tool-based-controlled-remediation.md)
  - [ADR-013: Production Containerization and Multi-Stage Builds](./docs/adr/ADR-013-production-containerization-and-multistage-docker-builds.md)
- 📐 **Architecture & System Design**: [docs/architecture/](./docs/architecture/)
  - [System Overview](./docs/architecture/system-overview.md) | [Service Catalog](./docs/architecture/service-catalog.md) | [Database Ownership](./docs/architecture/database-ownership.md) | [Event Flows](./docs/architecture/event-flows.md)
- 📊 **Diagrams**: [docs/diagrams/](./docs/diagrams/)
  - [Platform Architecture (`architecture.mmd`)](./docs/diagrams/architecture.mmd)
  - [Order Checkout Event Saga (`event-flow.mmd`)](./docs/diagrams/event-flow.mmd)
- 🔌 **API Documentation**: [docs/api/api-specification.md](./docs/api/api-specification.md)
- 🛠️ **Service Documentation**: [docs/services/](./docs/services/)
- 📘 **Operational Guides**: [docs/guides/](./docs/guides/)
  - [Local Setup Guide](./docs/guides/local-setup-guide.md)
  - [Cloud Deployment Guide (Azure & AKS)](./docs/guides/cloud-deployment-guide.md)
  - [CI/CD Documentation (Jenkins & Argo CD)](./docs/guides/cicd-documentation.md)
  - [AIOps Documentation](./docs/guides/aiops-documentation.md)
- 🚨 **Operational Runbooks**: [docs/runbooks/](./docs/runbooks/)
  - [RB-001: RabbitMQ Down](./docs/runbooks/RB-001-rabbitmq-broker-down.md)
  - [RB-002: PostgreSQL Saturation](./docs/runbooks/RB-002-postgres-connection-saturation.md)
  - [RB-003: Service CrashLoop](./docs/runbooks/RB-003-service-crashloop-backoff.md)
- 📝 **Incident Postmortems**: [docs/incidents/](./docs/incidents/)
  - [INC-20261003-01: RabbitMQ Backpressure Cascade](./docs/incidents/INC-20261003-01-rabbitmq-backpressure-cascade.md)

---

## 5. Quick Start (Run Full Platform Locally)

### 1. Start All 17 Containers via Docker Compose
```bash
docker compose up -d --build
```

### 2. Verify Health
```bash
docker compose ps
```

### 3. Run Automated E2E Platform Verification
```bash
./scripts/local/test-weekend4-docker.sh
```

---

## 6. Port Matrix

| Service | Port | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | `8080` | React Single Page Application |
| **API Gateway** | `8000` | Unified HTTP Ingress Proxy |
| **Auth Service** | `8001` | Authentication & RBAC |
| **Catalog Service** | `8002` | Product Inventory & Catalog |
| **Order Service** | `8003` | Order Lifecycle State Machine |
| **Inventory Service** | `8004` | Stock Reservations |
| **Payment Service** | `8005` | Payment Transactions |
| **Notification Service** | `8006` | Event Worker & Redis Inboxes |
| **PostgreSQL** | `5432` | Relational Databases |
| **Redis** | `6379` | In-Memory Store & Caching |
| **RabbitMQ Management** | `15672` | AMQP Management Dashboard (`guest`/`guest`) |
| **Prometheus** | `9090` | Metrics Scraper & TSDB |
| **Grafana** | `3001` | Observability Dashboards (`admin`/`admin`) |
| **Alertmanager** | `9093` | Alert Dispatcher |
