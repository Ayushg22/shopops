# ShopOps Engineering Documentation

Welcome to the comprehensive engineering documentation for **ShopOps**, an enterprise-grade cloud-native microservices e-commerce platform and SRE/AIOps laboratory.

This documentation is maintained in strict adherence to **Section 41 (ADR Standards)** and **Section 42 (Documentation Standards)** of [SHOPOPS_ARCHITECTURE_ENGINEERING_STANDARDS.md](file:///home/ayush-g/AI-OPS%20Project/SHOPOPS_ARCHITECTURE_ENGINEERING_STANDARDS.md).

---

## 📚 Documentation Index

### 1. Architecture Decisions (ADRs) — [docs/adr/](file:///home/ayush-g/AI-OPS%20Project/docs/adr/)
Complete architectural decision records following the standard format (Status, Context, Decision, Alternatives, Consequences):
- [ADR-001: Overall System Architecture](file:///home/ayush-g/AI-OPS%20Project/docs/adr/ADR-001-overall-system-architecture.md)
- [ADR-002: Microservice Boundaries](file:///home/ayush-g/AI-OPS%20Project/docs/adr/ADR-002-microservice-boundaries.md)
- [ADR-003: PostgreSQL Logical Database Ownership](file:///home/ayush-g/AI-OPS%20Project/docs/adr/ADR-003-postgresql-logical-database-ownership.md)
- [ADR-004: REST vs Asynchronous Messaging](file:///home/ayush-g/AI-OPS%20Project/docs/adr/ADR-004-rest-vs-asynchronous-messaging.md)
- [ADR-005: RabbitMQ Event Strategy](file:///home/ayush-g/AI-OPS%20Project/docs/adr/ADR-005-rabbitmq-event-strategy.md)
- [ADR-006: Azure and AKS as Primary Cloud](file:///home/ayush-g/AI-OPS%20Project/docs/adr/ADR-006-azure-and-aks-as-primary-cloud.md)
- [ADR-007: Terraform as Infrastructure Source of Truth](file:///home/ayush-g/AI-OPS%20Project/docs/adr/ADR-007-terraform-as-infrastructure-source-of-truth.md)
- [ADR-008: Jenkins for Continuous Integration](file:///home/ayush-g/AI-OPS%20Project/docs/adr/ADR-008-jenkins-for-ci.md)
- [ADR-009: Argo CD for GitOps Continuous Delivery](file:///home/ayush-g/AI-OPS%20Project/docs/adr/ADR-009-argo-cd-for-gitops-cd.md)
- [ADR-010: OpenTelemetry-Based Observability](file:///home/ayush-g/AI-OPS%20Project/docs/adr/ADR-010-opentelemetry-based-observability.md)
- [ADR-011: Chaos Engineering Approach](file:///home/ayush-g/AI-OPS%20Project/docs/adr/ADR-011-chaos-engineering-approach.md)
- [ADR-012: AIOps Tool-Based Controlled Remediation](file:///home/ayush-g/AI-OPS%20Project/docs/adr/ADR-012-aiops-tool-based-controlled-remediation.md)
- [ADR-013: Production Containerization and Multi-Stage Builds](file:///home/ayush-g/AI-OPS%20Project/docs/adr/ADR-013-production-containerization-and-multistage-docker-builds.md)

---

### 2. Architecture & Design — [docs/architecture/](file:///home/ayush-g/AI-OPS%20Project/docs/architecture/)
- [System Overview](file:///home/ayush-g/AI-OPS%20Project/docs/architecture/system-overview.md): Distributed architecture, platform pillars, and network topology.
- [Service Catalog](file:///home/ayush-g/AI-OPS%20Project/docs/architecture/service-catalog.md): Detailed matrix of all microservices, ports, databases, and dependencies.
- [Database Ownership](file:///home/ayush-g/AI-OPS%20Project/docs/architecture/database-ownership.md): Logical database isolation, schemas, and Redis key standards.
- [Asynchronous Event Flows](file:///home/ayush-g/AI-OPS%20Project/docs/architecture/event-flows.md): RabbitMQ topic exchange topology, DLQ handling, and saga sequence.

---

### 3. Architecture Diagrams — [docs/diagrams/](file:///home/ayush-g/AI-OPS%20Project/docs/diagrams/)
- [Platform Architecture Diagram (`architecture.mmd`)](file:///home/ayush-g/AI-OPS%20Project/docs/diagrams/architecture.mmd): Full 17-container architecture.
- [Order Checkout Event Flow (`event-flow.mmd`)](file:///home/ayush-g/AI-OPS%20Project/docs/diagrams/event-flow.mmd): End-to-end async order saga.

---

### 4. Service Documentation — [docs/services/](file:///home/ayush-g/AI-OPS%20Project/docs/services/)
- [API Gateway](file:///home/ayush-g/AI-OPS%20Project/docs/services/api-gateway.md)
- [Auth Service](file:///home/ayush-g/AI-OPS%20Project/docs/services/auth-service.md)
- [Catalog Service](file:///home/ayush-g/AI-OPS%20Project/docs/services/catalog-service.md)
- [Order Service](file:///home/ayush-g/AI-OPS%20Project/docs/services/order-service.md)
- [Inventory Service](file:///home/ayush-g/AI-OPS%20Project/docs/services/inventory-service.md)
- [Payment Service](file:///home/ayush-g/AI-OPS%20Project/docs/services/payment-service.md)
- [Notification Service](file:///home/ayush-g/AI-OPS%20Project/docs/services/notification-service.md)
- [Frontend SPA](file:///home/ayush-g/AI-OPS%20Project/docs/services/frontend.md)

---

### 5. API Documentation — [docs/api/](file:///home/ayush-g/AI-OPS%20Project/docs/api/)
- [API Gateway Specification](file:///home/ayush-g/AI-OPS%20Project/docs/api/api-specification.md): Complete route index, payload schemas, error formats, and correlation ID standards.

---

### 6. Operational Guides — [docs/guides/](file:///home/ayush-g/AI-OPS%20Project/docs/guides/)
- [Local Setup Guide](file:///home/ayush-g/AI-OPS%20Project/docs/guides/local-setup-guide.md): Running the complete platform locally via Docker Compose.
- [Cloud Deployment Guide](file:///home/ayush-g/AI-OPS%20Project/docs/guides/cloud-deployment-guide.md): Azure + AKS architecture and Terraform provisioning.
- [CI/CD Documentation](file:///home/ayush-g/AI-OPS%20Project/docs/guides/cicd-documentation.md): Jenkins declarative pipelines and Argo CD GitOps delivery.
- [AIOps Documentation](file:///home/ayush-g/AI-OPS%20Project/docs/guides/aiops-documentation.md): Autonomous incident diagnosis, tool permissions, and safe remediation.

---

### 7. Operational Runbooks — [docs/runbooks/](file:///home/ayush-g/AI-OPS%20Project/docs/runbooks/)
- [RB-001: RabbitMQ Broker Down](file:///home/ayush-g/AI-OPS%20Project/docs/runbooks/RB-001-rabbitmq-broker-down.md)
- [RB-002: PostgreSQL Connection Saturation](file:///home/ayush-g/AI-OPS%20Project/docs/runbooks/RB-002-postgres-connection-saturation.md)
- [RB-003: Microservice CrashLoopBackOff](file:///home/ayush-g/AI-OPS%20Project/docs/runbooks/RB-003-service-crashloop-backoff.md)
- [Runbook Template](file:///home/ayush-g/AI-OPS%20Project/docs/runbooks/runbook-template.md)

---

### 8. Incident Postmortems — [docs/incidents/](file:///home/ayush-g/AI-OPS%20Project/docs/incidents/)
- [INC-20261003-01: RabbitMQ Backpressure Cascade](file:///home/ayush-g/AI-OPS%20Project/docs/incidents/INC-20261003-01-rabbitmq-backpressure-cascade.md)
- [Incident Postmortem Template](file:///home/ayush-g/AI-OPS%20Project/docs/incidents/incident-postmortem-template.md)
