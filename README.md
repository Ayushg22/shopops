# ShopOps — Cloud-Native E-Commerce Platform

> **DevOps + Cloud + DevSecOps + GitOps + SRE + AIOps Portfolio Laboratory**

---

## 1. Project Overview

**ShopOps** is a production-grade, distributed microservices e-commerce platform built as a hands-on laboratory demonstrating:
- **Cloud Architecture**: Microsoft Azure & Azure Kubernetes Service (AKS)
- **Declarative Infrastructure**: Terraform (reusable modules, environment state)
- **CI / DevSecOps**: Jenkins (SonarQube SAST, Gitleaks secrets scanning, Trivy container scanning, Syft SBOM)
- **CD / GitOps**: Argo CD (App of Apps, declarative reconciliation, drift detection)
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
       |               |              |              |               |
       +---------------+--------------+--------------+---------------+
                                      |
                                   RabbitMQ
                                      |
                                      v
                          [ notification-service ]
```

---

## 3. Monorepo Directory Structure

```text
shopops/
├── apps/
│   └── frontend/                 # React + TypeScript frontend
│
├── services/
│   ├── api-gateway/              # Entry point, routing, auth checks, rate-limiting
│   ├── auth-service/             # User identity, authentication, JWT tokens (PostgreSQL)
│   ├── catalog-service/          # Products, categories, search (PostgreSQL)
│   ├── order-service/            # Order creation & state machine (PostgreSQL)
│   ├── inventory-service/        # Stock levels & reservations (PostgreSQL)
│   ├── payment-service/          # Payment simulation & audit (PostgreSQL)
│   └── notification-service/     # Asynchronous event worker (RabbitMQ)
│
├── packages/
│   ├── shared-types/             # TypeScript domain models, event contracts, API DTOs
│   ├── logger/                   # Structured JSON logger with correlation IDs
│   ├── config/                   # Configuration loader with Zod validation
│   └── observability/            # OpenTelemetry SDK tracer and Prometheus metrics
│
├── infra/
│   └── terraform/
│       ├── modules/              # network, aks, postgres, acr, keyvault, monitoring
│       └── environments/         # dev, prod
│
├── deploy/
│   ├── helm/                     # Independent Helm charts for each service
│   ├── gitops/                   # Argo CD Application CRDs (App of Apps)
│   └── k8s-local/                # Base manifests for local kind/k3d development
│
├── monitoring/
│   ├── prometheus/               # Prometheus config, alerts, recording rules
│   ├── grafana/                  # Provisioned datasources and dashboards
│   ├── loki/                     # Structured log aggregation config
│   ├── tempo/                    # Distributed tracing config
│   ├── alertmanager/             # Alert routing & AIOps webhook target
│   └── otel-collector/           # OpenTelemetry collector pipeline
│
├── aiops/
│   ├── agent/                    # TypeScript LLM agent runtime
│   ├── tools/                    # Diagnostic & remediation tools
│   ├── policies/                 # Least privilege & blast radius guardrails
│   ├── runbooks/                 # Automated incident runbooks
│   └── prompts/                  # Diagnostic & verification prompts
│
├── jenkins/
│   ├── Jenkinsfile               # Multi-stage CI pipeline
│   └── shared-library/           # Reusable pipeline steps
│
├── chaos/
│   ├── experiments/              # Fault injection scripts (pod kill, CPU stress, DB leak)
│   └── scenarios/                # SRE failure scenarios
│
├── tests/
│   ├── load/                     # k6 load testing scripts (normal, spike, sustained, burst)
│   └── e2e/                      # End-to-end integration workflows
│
├── docs/
│   ├── architecture/             # System overview, DB ownership, event flows
│   ├── adr/                      # Architecture Decision Records (ADR-001 to ADR-012)
│   ├── runbooks/                 # Operational runbooks
│   └── incidents/                # Incident postmortem reports
│
├── scripts/
│   ├── local/                    # Local environment setup and initialization
│   └── ci/                       # CI validation scripts
│
├── docker-compose.yml            # Local development dependencies stack
├── package.json                  # Monorepo workspaces definition
└── tsconfig.base.json            # Base strict TypeScript compiler settings
```

---

## 4. Engineering Standards & Plan References

- **Implementation Roadmap**: [SHOPOPS_PROJECT_PLAN.md](file:///home/ayush-g/AI-OPS%20Project/SHOPOPS_PROJECT_PLAN.md)
- **Architecture & Engineering Standards**: [SHOPOPS_ARCHITECTURE_ENGINEERING_STANDARDS.md](file:///home/ayush-g/AI-OPS%20Project/SHOPOPS_ARCHITECTURE_ENGINEERING_STANDARDS.md)

---

## 5. Quick Start (Local Development)

### 1. Initialize Environment
```bash
./scripts/local/setup-local-env.sh
```

### 2. Start Local Supporting Services
```bash
docker compose up -d
```
Starts PostgreSQL, Redis, RabbitMQ, Prometheus, Grafana, Loki, Tempo, and OpenTelemetry Collector.

### 3. Verify Health
```bash
./scripts/local/verify-health.sh
```
