# ADR-001: Overall System Architecture

## Status
Accepted

## Context
ShopOps is designed as an enterprise-grade cloud-native e-commerce platform and SRE/AIOps laboratory. The architecture must satisfy two core requirements simultaneously:
1. Provide a realistic, scalable, distributed e-commerce workflow (authentication, product browsing, cart/ordering, real-time stock reservations, payment authorization, and event notifications).
2. Serve as a resilient testbed for high-severity failure modes (cascading timeouts, network partitions, split-brain conditions, broker saturation) to exercise modern observability, Chaos Engineering, and automated AIOps remediation.

A simple monolithic architecture would hide distributed systems failure modes (partial failures, network latency, distributed consensus, data synchronization), while an excessively fragmented microservices topology would introduce prohibitive operational overhead for local development and cloud hosting costs.

## Decision
We adopted a **Hybrid Distributed Microservices Architecture in an npm Monorepo**, consisting of:
- **API Gateway (Express)**: Unified ingress reverse proxy handling JWT authentication, correlation ID propagation (`x-correlation-id`), rate-limiting, and client routing.
- **Frontend SPA (React + TypeScript + Vite)**: Production-served via Nginx reverse proxy with dynamic internal Docker DNS resolution.
- **Seven Specialized Microservices (Node.js + TypeScript)**:
  - `auth-service` (Port 8001)
  - `catalog-service` (Port 8002)
  - `order-service` (Port 8003)
  - `inventory-service` (Port 8004)
  - `payment-service` (Port 8005)
  - `notification-service` (Port 8006)
- **Data & Messaging Tier**:
  - Logical PostgreSQL Database-per-Service for transactional boundaries (`shopops_auth`, `shopops_catalog`, `shopops_order`, `shopops_inventory`, `shopops_payment`).
  - Redis for customer notification inboxes, transient tokens, and caching.
  - RabbitMQ topic exchange (`shopops.events`) for asynchronous distributed event cascades.
- **Observability Backbone**:
  - OpenTelemetry SDK instrumenting all HTTP and AMQP workflows.
  - OTel Collector aggregating metrics, traces, and logs.
  - Prometheus, Grafana, Loki, Tempo, and Alertmanager.

## Alternatives Considered
1. **Modular Monolith**:
   - *Pros*: Extremely easy local development and single database transactions.
   - *Cons*: Cannot reproduce real-world distributed networking failures, microservice crashloop cascades, async message dead-lettering, or independent Kubernetes autoscaling. Rejected.
2. **Polyglot Multi-Repo Architecture (e.g. Go, Java, Python in separate repos)**:
   - *Pros*: Extreme language flexibility.
   - *Cons*: Excessive context-switching, unmaintainable dependency version drift across 8+ repositories, and severe build friction for local developers. Monorepo with TypeScript ensures strong shared contracts (`@shopops/shared-types`) while preserving strict microservice boundary isolation.

## Consequences
- **Benefits**:
  - Realistic enterprise distributed systems behavior (eventual consistency, network latency, distributed tracing).
  - Clear domain boundaries that translate directly into Kubernetes Deployments and independent CI/CD artifacts.
  - Strict TypeScript types shared via monorepo packages (`packages/config`, `packages/logger`, `packages/shared-types`, `packages/observability`).
- **Trade-offs**:
  - Distributed data management requires compensating transactions (Sagas) rather than database ACID cross-table joins.
  - Developer laptop must run multiple containers (managed efficiently via Docker Compose resource constraints).
