# ShopOps — Cloud-Native E-Commerce Platform

## DevOps + Cloud + DevSecOps + GitOps + SRE + AIOps Portfolio Project

> **Project goal:** Build a production-style, multi-tier microservices e-commerce platform and use it as a hands-on laboratory for taking existing DevOps knowledge to the next level while learning Azure, advanced Kubernetes operations, IaC, GitOps, observability, reliability engineering, and controlled AI-driven remediation.

---

# 1. Project Vision

This project is not intended to become a commercial e-commerce product. The application exists to create a realistic distributed system on which modern DevOps, cloud, security, SRE, and AIOps practices can be implemented and demonstrated.

The final platform should demonstrate the full lifecycle:

```text
Application Development
        ↓
Microservices
        ↓
Docker
        ↓
Kubernetes
        ↓
Terraform / IaC
        ↓
Azure AKS
        ↓
Jenkins CI
        ↓
DevSecOps
        ↓
Helm
        ↓
Argo CD GitOps
        ↓
Observability
        ↓
Autoscaling
        ↓
Alerting
        ↓
Chaos / Failure Engineering
        ↓
AIOps Investigation
        ↓
Controlled Autonomous Remediation
        ↓
Automated Verification + Audit
```

The project's final portfolio story should be:

> I designed and operated a cloud-native e-commerce platform on Azure AKS using Terraform, Jenkins CI, DevSecOps controls and Argo CD GitOps. The platform emits metrics, logs and distributed traces through OpenTelemetry. I implemented SRE-style SLOs, autoscaling, alerting and controlled chaos experiments. Finally, I built an AIOps agent backed by an Azure-hosted LLM that investigates incidents using live Kubernetes and observability data and performs policy-controlled autonomous remediation, followed by automated verification and audit logging.

---

# 2. Final Project Decisions

| Decision | Final Choice |
|---|---|
| Project purpose | Portfolio + interview showcase |
| Application domain | E-commerce |
| Primary cloud | Microsoft Azure |
| Kubernetes | Azure Kubernetes Service (AKS) |
| Cost model | Azure free credits / free-tier eligible resources only |
| Cloud usage strategy | Temporary lab environment; destroy resources when not actively demonstrating |
| Development schedule | ~8 hours per weekend |
| Core backend | Node.js + TypeScript |
| Frontend | React + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache | Redis |
| Message broker | RabbitMQ |
| Repository model | Monorepo |
| Containerization | Docker |
| Local Kubernetes | kind or k3d |
| IaC | Terraform |
| CI | Jenkins |
| Container registry | Azure Container Registry (ACR) |
| CD / GitOps | Argo CD |
| Kubernetes packaging | Helm |
| Observability | OpenTelemetry + Prometheus + Grafana + Loki + Tempo |
| Load testing | k6 |
| Security level | Basic DevSecOps, implemented properly rather than excessively |
| SAST | SonarQube |
| Secret scanning | Gitleaks |
| Container scanning | Trivy |
| SBOM | Syft |
| Chaos engineering | Yes |
| AIOps mode | Controlled autonomous remediation |
| AI model | Azure-hosted LLM |
| AI agent | Custom TypeScript agent with tool/function calling |
| AI permissions | Least privilege; explicit read and remediation tools |
| AI execution model | Observe → Recommend → Controlled Autonomous |

---

# 3. Core Architecture

## 3.1 Application Architecture

```text
                         ┌──────────────────┐
                         │     Internet     │
                         └────────┬─────────┘
                                  │
                           DNS / HTTPS
                                  │
                          Ingress Controller
                                  │
                          ┌───────▼───────┐
                          │   Frontend    │
                          │ React + TS    │
                          └───────┬───────┘
                                  │
                            API Gateway
                                  │
       ┌──────────────┬───────────┼───────────┬──────────────┐
       │              │           │           │              │
       ▼              ▼           ▼           ▼              ▼
     Auth          Catalog       Order     Inventory       Payment
   Service         Service      Service     Service        Service
       │              │           │           │              │
       └──────────────┴───────────┼───────────┴──────────────┘
                                  │
                            Message Broker
                               RabbitMQ
                                  │
                                  ▼
                         Notification Worker
```

## 3.2 Infrastructure Architecture

```text
Terraform
    │
    ├── Azure Resource Group
    ├── VNet
    ├── Subnets
    ├── AKS
    ├── Node Pool(s)
    ├── Azure Container Registry
    ├── PostgreSQL Flexible Server
    ├── Azure Key Vault
    ├── Storage
    └── Supporting monitoring / identity resources
```

## 3.3 Delivery Architecture

```text
Developer
    │
    ▼
Git / GitHub
    │
    ▼
Jenkins
    │
    ├── Lint
    ├── Unit tests
    ├── SAST
    ├── Dependency scan
    ├── Secret scan
    ├── Build
    ├── Container scan
    ├── SBOM
    └── Image build / publish
            │
            ▼
           ACR
            │
            ▼
      GitOps configuration
            │
            ▼
         Argo CD
            │
            ▼
           AKS
```

### CI/CD separation principle

**Jenkins builds and validates artifacts. Argo CD owns deployment and reconciliation.**

Jenkins should not directly deploy production with `kubectl apply`.

---

# 4. Observability Architecture

```text
Application
     │
     ▼
OpenTelemetry
     │
 ┌───┼───────────────┐
 ▼   ▼               ▼
Metrics Logs        Traces
 ▼    ▼               ▼
Prom  Loki           Tempo
 └────┴───────┬───────┘
              ▼
           Grafana
              │
              ▼
         Alertmanager
              │
              ▼
       Incident / Event Gateway
              │
              ▼
          AIOps Agent
```

The open observability stack is the main application-level observability layer. Azure-native monitoring can be used for cloud and infrastructure-specific signals.

---

# 5. AIOps Architecture

The AIOps layer should be implemented as a controlled operations assistant, not as an unrestricted shell-access chatbot.

## 5.1 Read / Diagnostic Tools

The agent should initially be able to call tools such as:

```text
get_cluster_health()
get_pods()
get_deployments()
get_events()
get_node_health()
query_prometheus()
query_logs()
query_traces()
get_argocd_app_status()
get_recent_deployments()
get_jenkins_builds()
get_git_changes()
read_runbook()
incident_history()
service_dependencies()
```

## 5.2 Remediation Tools

Initial controlled actions:

```text
restart_deployment()
rollback_deployment()
scale_deployment()
pause_rollout()
```

Do **not** expose a generic `execute_command()` or unrestricted Kubernetes shell to the agent.

## 5.3 Remediation Guardrail

```text
AI diagnosis
     ↓
Remediation Policy
     ↓
Is action allowed?
     ↓
Is target allowed?
     ↓
Is severity compatible?
     ↓
Is blast radius acceptable?
     ↓
Execute
     ↓
Observe
     ↓
Verification successful?
   ┌───────┴────────┐
  YES              NO
   │                │
   ▼                ▼
Close incident   Rollback / Escalate
   │                │
   └───────┬────────┘
           ▼
      Audit record
```

## 5.4 AI Operating Modes

### Mode 1 — Observe

The agent explains what is happening using real system evidence.

### Mode 2 — Recommend

The agent identifies likely causes and proposes remediation without executing it.

### Mode 3 — Controlled Autonomous

The agent performs only explicitly approved low-risk actions through dedicated tools and validates the result afterward.

---

# 6. Application Services

The application should contain a manageable number of meaningful services rather than an artificially large number of microservices.

## 6.1 API Gateway

Responsibilities:

- route requests to services
- authentication / authorization enforcement where appropriate
- request correlation ID propagation
- common HTTP middleware
- rate limiting where useful
- centralized API entry point

## 6.2 Auth Service

Responsibilities:

```text
register
login
JWT
refresh token
users
roles
```

## 6.3 Catalog Service

Responsibilities:

```text
products
categories
product search
product details
stock visibility
```

## 6.4 Order Service

Responsibilities:

```text
create order
order state
order history
cancel order
```

## 6.5 Inventory Service

Responsibilities:

```text
reserve stock
release stock
update stock
```

## 6.6 Payment Service

No real payment provider is required for the core project.

Simulate:

```text
SUCCESS
FAILED
TIMEOUT
```

This makes controlled incident generation easier and removes external payment complexity.

## 6.7 Notification Service

Consumes asynchronous events such as:

```text
OrderCreated
PaymentCompleted
PaymentFailed
OrderShipped
OrderCancelled
```

and simulates email / SMS notification delivery.

---

# 7. Event-Driven Flow

The application should not be purely synchronous.

Example:

```text
POST /orders
      ↓
Order created
      ↓
OrderCreated event
      ↓
RabbitMQ
      ↓
Inventory reserves stock
      ↓
Payment processes payment
      ↓
Notification sent
```

This creates realistic distributed-system behavior and failure modes:

```text
message duplication
message delay
consumer crash
queue backlog
retry
dead-letter queue
```

---

# 8. Database Strategy

Use one PostgreSQL server for cost efficiency while maintaining logical database ownership per service.

```text
PostgreSQL
│
├── auth_db
├── catalog_db
├── order_db
├── inventory_db
└── payment_db
```

The interview explanation should be:

> Database-per-service ownership is implemented logically while using one PostgreSQL instance to control portfolio-project costs.

Redis is used for caching and short-lived application state where appropriate.

RabbitMQ is used for asynchronous business events and worker processing.

---

# 9. Monorepo Structure

```text
shopops/
│
├── apps/
│   └── frontend/
│
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── catalog-service/
│   ├── order-service/
│   ├── inventory-service/
│   ├── payment-service/
│   └── notification-service/
│
├── packages/
│   ├── shared-types/
│   ├── logger/
│   ├── config/
│   └── observability/
│
├── infra/
│   └── terraform/
│       ├── modules/
│       │   ├── network/
│       │   ├── aks/
│       │   ├── postgres/
│       │   ├── acr/
│       │   ├── keyvault/
│       │   └── monitoring/
│       │
│       └── environments/
│           ├── dev/
│           └── prod/
│
├── deploy/
│   ├── helm/
│   │   ├── api-gateway/
│   │   ├── auth/
│   │   ├── catalog/
│   │   ├── order/
│   │   ├── inventory/
│   │   ├── payment/
│   │   └── notification/
│   │
│   └── gitops/
│       ├── apps/
│       └── environments/
│
├── monitoring/
│   ├── prometheus/
│   ├── grafana/
│   ├── loki/
│   ├── tempo/
│   └── alertmanager/
│
├── aiops/
│   ├── agent/
│   ├── tools/
│   ├── policies/
│   ├── runbooks/
│   └── prompts/
│
├── jenkins/
│   ├── Jenkinsfile
│   └── shared-library/
│
├── chaos/
│
├── docs/
│   ├── architecture/
│   ├── adr/
│   ├── runbooks/
│   ├── incidents/
│   └── diagrams/
│
└── README.md
```

---

# 10. Kubernetes Scope

The local and cloud Kubernetes implementation should cover:

```text
Namespace
Deployment
Service
Ingress
ConfigMap
Secret
ServiceAccount
RBAC
Resource requests / limits
Startup probe
Readiness probe
Liveness probe
PodDisruptionBudget
NetworkPolicy
Job
CronJob
PersistentVolume / PVC where needed
Rolling deployments
HPA
VPA
Node / cluster autoscaling
```

The goal is to understand not only how to write manifests, but how Kubernetes controllers, scheduling, health probes, resource management, and reconciliation behave operationally.

---

# 11. Terraform Scope

Terraform should provision the cloud environment without manual resource creation for the final setup.

## Target Azure Resources

```text
Resource Group
VNet
Subnets
NSGs / firewall rules
AKS
AKS node pool(s)
Azure Container Registry
PostgreSQL Flexible Server
Azure Key Vault
Storage
Managed identity / workload identity
Supporting monitoring resources
```

## Terraform Structure

```text
infra/terraform/
├── modules/
│   ├── network/
│   ├── aks/
│   ├── postgres/
│   ├── acr/
│   ├── keyvault/
│   └── monitoring/
│
└── environments/
    ├── dev/
    └── prod/
```

Skills to learn/revise:

```text
providers
resources
variables
outputs
modules
data sources
state
dependencies
remote backend
drift
plan / apply / destroy
```

Terraform state should eventually be stored remotely, using an Azure Storage backend.

---

# 12. Jenkins CI Pipeline

The pipeline should progress through increasing confidence gates.

```text
Git push
   ↓
Checkout
   ↓
Install dependencies
   ↓
Lint
   ↓
Unit tests
   ↓
SonarQube SAST
   ↓
Dependency / SCA checks
   ↓
Gitleaks secret scan
   ↓
Trivy filesystem scan
   ↓
Docker build
   ↓
Trivy image scan
   ↓
Generate SBOM
   ↓
Optional image signing / verification
   ↓
Push image to ACR
   ↓
Update GitOps deployment state
```

### Delivery principle

Jenkins should build and validate. GitOps state should be updated after a successful build. Argo CD should reconcile that Git state into AKS.

---

# 13. DevSecOps Scope

The chosen security scope is intentionally **basic but real**.

## Required

```text
SonarQube
Gitleaks
Trivy
SBOM generation
npm dependency auditing
Kubernetes RBAC
NetworkPolicy
Azure Key Vault
Least-privilege identity
```

## Optional Stretch

```text
Cosign image signing
```

The project should demonstrate defense in depth without becoming a dedicated security-platform project.

---

# 14. Helm Strategy

Each independently deployable service should have a Helm chart.

```text
deploy/helm/
├── api-gateway/
├── auth/
├── catalog/
├── order/
├── inventory/
├── payment/
└── notification/
```

Environment-specific values should be separated from reusable chart templates.

```text
values/
├── dev/
└── prod/
```

Important Helm topics:

```text
templates
values
helpers
release management
environment configuration
chart dependencies
```

---

# 15. GitOps Strategy

Final desired-state flow:

```text
Developer
    ↓
Application repo
    ↓
Jenkins CI
    ↓
Build + Test + Security
    ↓
ACR
    ↓
Update image version / GitOps state
    ↓
GitOps repository
    ↓
Argo CD
    ↓
AKS
```

Key concepts to understand:

```text
desired state
reconciliation
drift
sync
health
rollback
```

Argo CD should become the deployment authority for the Kubernetes environments.

---

# 16. Observability Scope

The platform should implement all three major observability signals:

## Metrics

Prometheus.

Examples:

```text
http_requests_total
http_request_duration_seconds
order_created_total
payment_failed_total
inventory_reservation_failed_total
rabbitmq_queue_messages
```

## Logs

Loki + Grafana.

Application logs should be structured JSON and include fields such as:

```text
timestamp
level
service
environment
request_id
trace_id
user_id where appropriate
message
error details
```

## Traces

OpenTelemetry + Tempo.

Trace context should propagate between services and into asynchronous operations where possible.

## Dashboards

At minimum create dashboards showing:

```text
request rate
error rate
p95 / p99 latency
CPU
memory
pod count
orders
payments
queue depth
DB signals
```

---

# 17. SRE / Reliability Model

Define basic service-level objectives before building alert rules.

Example concepts:

```text
Availability SLO
Latency SLO
Error-rate SLO
Queue processing SLO
```

The system should distinguish between:

```text
signal
alert
incident
root cause hypothesis
remediation
verification
```

Runbooks should exist for common incidents before the AIOps agent is made autonomous.

---

# 18. Autoscaling

Implement and demonstrate:

```text
HPA
 ↓
pod count

VPA
 ↓
resource requests / limits

Cluster / node autoscaling
 ↓
node capacity
```

Use k6 to generate controlled traffic.

Example learning experiment:

```text
Traffic ↑
  ↓
CPU ↑
  ↓
HPA activates
  ↓
Pod count ↑
  ↓
Node capacity may need to ↑
```

Also inspect VPA recommendations and understand when vertical and horizontal scaling approaches conflict or complement each other.

---

# 19. Chaos Engineering

## Decision: Include Chaos Engineering

Chaos engineering is an important part of this project because it creates realistic incidents for the monitoring, alerting, SRE, and AIOps layers to detect and resolve.

## Start Manually

First understand failure mechanics with basic operational actions:

```text
kubectl delete pod
kubectl scale deployment
CPU stress
memory stress
break configuration
introduce latency
stop consumers
```

## Then Automate

Use Chaos Mesh for formal experiments once the failure modes are understood.

## Planned Failure Scenarios

```text
Pod crash
OOMKilled
CPU spike
Memory leak
High latency
HTTP 5xx spike
Failed readiness probe
Node pressure
Redis unavailable
RabbitMQ consumer crash
Queue backlog
Database connection exhaustion
Bad deployment
Broken configuration
```

Every experiment should define:

```text
Hypothesis
Blast radius
Injection
Expected signal
Alert
Diagnosis
Remediation
Verification
Rollback
Post-incident notes
```

---

# 20. AIOps Incident Lifecycle

A final incident should follow this pattern:

```text
Failure introduced
      ↓
Telemetry changes
      ↓
Prometheus detects condition
      ↓
Alertmanager fires alert
      ↓
Incident gateway
      ↓
AIOps agent invoked
      ↓
Agent gathers evidence
      ↓
Agent correlates signals
      ↓
Diagnosis / hypothesis
      ↓
Select approved runbook
      ↓
Policy validation
      ↓
Remediation action
      ↓
Observe system
      ↓
Verification
      ├── Success → resolve
      └── Failure → rollback / escalate
      ↓
Audit record
```

---

# 21. AIOps Tool Design

## Diagnostic Tools

```text
get_cluster_health()
get_pods()
get_deployments()
get_events()
get_node_health()
query_prometheus()
query_logs()
query_traces()
get_argocd_app_status()
get_recent_deployments()
get_jenkins_builds()
get_git_changes()
read_runbook()
incident_history()
service_dependencies()
```

## Remediation Tools

```text
restart_deployment()
rollback_deployment()
scale_deployment()
pause_rollout()
```

## Future Extensions

```text
create_incident()
update_incident()
annotate_incident()
```

---

# 22. AI Security Model

The agent should use least privilege.

## Do

```text
Use dedicated tools
Use Kubernetes RBAC
Restrict namespaces
Restrict allowed deployments
Restrict action types
Log every action
Verify every remediation
Require stronger controls for higher-risk actions
```

## Do Not

```text
Give cluster-admin
Expose arbitrary shell execution
Give direct node access
Allow unrestricted kubectl
Allow arbitrary production changes
Skip verification
```

The agent is an operations component with explicit capabilities, not a root user with an LLM attached.

---

# 23. Final AIOps Hero Demonstration

One of the final portfolio demonstrations should intentionally deploy a faulty version of the order service.

Example:

```text
order-service v1.4.2
```

Suppose the new release creates excessive database connections.

The system should detect:

```text
DB connections ↑
      ↓
Order latency ↑
      ↓
5xx errors ↑
      ↓
Prometheus alert
      ↓
Alertmanager
      ↓
AIOps Agent
```

The agent should investigate live evidence:

```text
Order Service Investigation
────────────────────────────

Current p95 latency: 2.7s
Baseline: 320ms

CPU: 91%
Memory: 72%

Pods restarted in last 15 minutes: 2

HTTP 5xx: increased significantly

DB connection utilization: 96%

Recent deployment: v1.4.2

Deployment timing correlates with degradation.
```

The agent should produce a diagnosis with evidence, identify an approved remediation, execute it, and verify recovery.

Example outcome:

```text
Rollback order-service to v1.4.1
       ↓
Action allowed by policy
       ↓
Rollback executed
       ↓
p95 latency: 2.7s → 370ms
5xx rate: elevated → normal
DB connections: 96% → 51%
       ↓
Incident resolved
       ↓
Audit record written
```

The exact numbers are illustrative; the real demo should use measured values from the live test.

---

# 24. AIOps Chat Experience

The final system should allow an operator to ask questions such as:

```text
Why is order-service slow?

What changed before this incident?

Which service is causing the increase in 5xx errors?

Why are RabbitMQ queues growing?

Is the latest deployment healthy?

What caused the last incident?

What is consuming the most CPU right now?

Which pods restarted in the last 30 minutes?

Show me the current state of the payment service.
```

The agent should answer from live operational evidence, not from static project documentation alone.

---

# 25. Cost Strategy

The project should be designed around **free credits / free-tier resources only**.

## Local Lab

Most work should happen locally:

```text
Docker
kind / k3d
PostgreSQL
Redis
RabbitMQ
Prometheus
Grafana
Loki
Tempo
Argo CD
Jenkins
SonarQube
```

Expected cloud cost:

```text
₹0
```

## Azure Lab

Cloud deployment should be temporary:

```text
AKS
ACR
PostgreSQL Flexible Server
Key Vault
Storage
minimal supporting services
```

Create Azure resources when needed for a specific milestone or demonstration and destroy them afterward when practical.

Preferred lifecycle:

```text
Terraform apply
     ↓
Cloud lab
     ↓
Test / demo
     ↓
Capture evidence
     ↓
Terraform destroy
```

## Cost-Control Rules

```text
No unnecessary always-on resources
No multi-region deployment
No multiple production clusters
No oversized node pools
No unnecessary managed services
No continuous AI polling
Use AI inference primarily in response to incidents / operator questions
Destroy temporary environments
```

---

# 26. 16-Weekend Learning Roadmap

At ~8 hours per weekend, the core implementation target is roughly **16 weekends / ~128 hours**.

---

## Weekend 1 — Architecture & Engineering Standards

### Learn / Revise

```text
Microservice boundaries
Synchronous vs asynchronous communication
API contracts
SLI / SLO basics
Failure domains
12-factor principles
Threat modeling
```

### Deliverables

```text
High-level architecture diagram
Service map
Database ownership diagram
Event-flow diagram
Initial README
ADR-001: Architecture
Failure-scenario list
```

Do not start with AKS or Terraform.

---

## Weekend 2 — Service Foundation

Build the initial services using:

```text
Node.js
TypeScript
Fastify or Express
Prisma
PostgreSQL
Zod
Structured logging
```

Implement:

```text
configuration
health endpoints
graceful shutdown
request IDs
basic API versioning
```

Target: first 2–3 services fully working.

---

## Weekend 3 — Complete Application

Finish the service set:

```text
API Gateway
Auth
Catalog
Order
Inventory
Payment
Notification
```

Introduce RabbitMQ.

Implement:

```text
Order → Inventory → Payment → Notification
```

Deliverable: complete business flow running locally.

---

## Weekend 4 — Docker

Create production-oriented images for each service.

Learn:

```text
multi-stage builds
image layers
container networking
volumes
resource limits
non-root containers
health checks
```

Create:

```text
docker-compose.yml
```

Deliverable: full local platform starts through Docker Compose.

---

## Weekend 5 — Kubernetes Locally

Use kind or k3d.

Deploy:

```text
Namespace
Deployment
Service
Ingress
ConfigMap
Secret
```

Then implement:

```text
requests / limits
startup probe
readiness probe
liveness probe
PDB
RBAC
NetworkPolicy
```

Deliverable: full platform running on local Kubernetes.

---

## Weekend 6 — Helm

Convert manifests into Helm charts.

Learn:

```text
templates
values
helpers
release management
environment values
chart dependencies
```

Deliverable:

```text
helm install shopops ...
```

should deploy the platform.

---

## Weekend 7 — Terraform + Azure Foundation

Start the Azure infrastructure.

Provision:

```text
Resource Group
VNet
Subnets
AKS
ACR
PostgreSQL
Key Vault
Storage
Identity / permissions
```

Learn:

```text
providers
resources
variables
outputs
modules
data sources
state
dependencies
remote backend
drift
```

Deliverable: reproducible Azure environment through Terraform.

---

## Weekend 8 — AKS Deployment

Deploy the platform to AKS.

Learn / configure:

```text
AKS
node pools
ACR integration
Azure networking
Azure CLI
Kubernetes identities
workload identity / managed identity
```

Deliverable: first real cloud deployment.

---

## Weekend 9 — Jenkins CI

Implement:

```text
Git push
 ↓
Jenkins
 ↓
Lint
 ↓
Unit tests
 ↓
Security / quality checks
 ↓
Docker build
 ↓
Push image to ACR
```

Deliverable: repeatable automated CI.

---

## Weekend 10 — DevSecOps

Implement:

```text
SonarQube
Gitleaks
Trivy
SBOM
npm dependency checks
Kubernetes RBAC
NetworkPolicy
Key Vault
```

Optional:

```text
Cosign image signing
```

Deliverable: security gates integrated into CI and runtime.

---

## Weekend 11 — GitOps with Argo CD

Implement:

```text
GitOps repository structure
Helm-based deployment
Argo CD applications
Sync
Health
Drift
Rollback
```

Deliverable: Git becomes the deployment source of truth.

---

## Weekend 12 — Observability

Install/configure:

```text
OpenTelemetry
Prometheus
Grafana
Loki
Tempo
Alertmanager
```

Instrument services with:

```text
metrics
structured logs
trace context
```

Build dashboards for:

```text
request rate
error rate
latency
CPU
memory
pod count
orders
payments
queue depth
```

Deliverable: complete telemetry pipeline.

---

## Weekend 13 — Autoscaling + Load Testing

Implement:

```text
HPA
VPA
k6
```

Perform controlled load experiments.

Deliverable: documented scaling experiment showing observed behavior.

---

## Weekend 14 — Chaos / Failure Engineering

Manually test failure scenarios first, then automate selected scenarios with Chaos Mesh.

Deliverables:

```text
Chaos experiments
Incident evidence
Runbooks
Recovery measurements
Post-incident notes
```

---

## Weekend 15 — AIOps Agent

Build the custom TypeScript agent.

Implement read-only diagnostic tools:

```text
Kubernetes
Prometheus
Loki
Tempo
Argo CD
Jenkins
Git
Runbooks
```

Implement LLM tool calling and evidence gathering.

Deliverable: AI incident investigator.

---

## Weekend 16 — Controlled Autonomous Remediation

Implement:

```text
Policy validation
Approved remediation tools
Restart deployment
Rollback deployment
Scale deployment
Pause rollout
Post-action verification
Audit trail
```

Deliverable: end-to-end controlled autonomous incident remediation.

---

# 27. Project Maturity Ladder

```text
LEVEL 1
Working application
        ↓
LEVEL 2
Containerized application
        ↓
LEVEL 3
Kubernetes application
        ↓
LEVEL 4
Terraform-managed Azure infrastructure
        ↓
LEVEL 5
Jenkins CI
        ↓
LEVEL 6
DevSecOps
        ↓
LEVEL 7
Argo CD GitOps
        ↓
LEVEL 8
Observability
        ↓
LEVEL 9
Autoscaling
        ↓
LEVEL 10
Reliability + Chaos
        ↓
LEVEL 11
Alerting + Runbooks
        ↓
LEVEL 12
AI Incident Assistant
        ↓
LEVEL 13
Controlled Autonomous Remediation
        ↓
LEVEL 14
Production-style Portfolio Demo
```

---

# 28. What This Project Should Teach

## Linux / OS

```text
processes
signals
CPU / memory
networking
systemd
logs
filesystems
```

## Docker

```text
layers
multi-stage builds
networking
volumes
resource limits
image security
```

## Kubernetes

```text
scheduler
controllers
deployments
services
ingress
probes
requests / limits
RBAC
NetworkPolicy
HPA
VPA
PDB
autoscaling
rolling deployments
```

## Azure

```text
VNet
subnets
NSGs / firewall
AKS
ACR
Managed Identity
Workload Identity
Key Vault
PostgreSQL
Azure Monitor
Cost awareness
```

## Terraform

```text
state
modules
providers
variables
outputs
data sources
dependencies
remote backend
drift
plan / apply / destroy
```

## CI/CD

```text
Jenkins
pipeline-as-code
artifacts
quality gates
security gates
image promotion
```

## GitOps

```text
desired state
reconciliation
drift
Argo CD
sync
rollback
```

## DevSecOps

```text
SAST
SCA
secret scanning
container scanning
SBOM
RBAC
secrets management
network isolation
```

## SRE

```text
SLI
SLO
error budgets
alerting
incident response
runbooks
postmortems
chaos engineering
```

## Observability

```text
metrics
logs
traces
correlation
distributed tracing
RED metrics
golden signals
```

## AIOps

```text
LLM tool calling
agent architecture
incident analysis
context gathering
reasoning
safe automation
policy enforcement
verification
self-healing
auditability
```

---

# 29. Portfolio / Interview Documentation

The repository should document not only what was built, but **why** it was built that way.

## Recommended documentation

```text
docs/
├── architecture/
│   ├── overview.md
│   ├── application-flow.md
│   ├── deployment-flow.md
│   ├── observability.md
│   └── aiops.md
│
├── adr/
│   ├── ADR-001-architecture.md
│   ├── ADR-002-database-strategy.md
│   ├── ADR-003-async-messaging.md
│   ├── ADR-004-gitops.md
│   └── ADR-005-ai-remediation-model.md
│
├── runbooks/
│   ├── service-crash.md
│   ├── high-latency.md
│   ├── database-exhaustion.md
│   ├── queue-backlog.md
│   └── failed-deployment.md
│
├── incidents/
│   ├── incident-001.md
│   ├── incident-002.md
│   └── incident-003.md
│
└── diagrams/
```

## Final README should include

```text
Project overview
Architecture
Technology stack
Repository structure
How to run locally
How to provision Azure
CI/CD flow
GitOps flow
Observability screenshots
Security pipeline
Chaos experiments
AIOps architecture
Autonomous remediation demo
Cost-control approach
Lessons learned
```

---

# 30. Portfolio Demo Sequence

The final demonstration should be structured like a real engineering review.

## Demo 1 — Application

Show:

```text
User registers
User logs in
Products are browsed
Order is created
Inventory updates
Payment is processed
Notification is emitted
```

## Demo 2 — CI/CD

Show:

```text
Git push
Jenkins pipeline
Tests
Security gates
Docker build
Image published
```

## Demo 3 — GitOps

Show:

```text
GitOps change
Argo CD detects change
Sync
Deployment
Health
```

## Demo 4 — Observability

Show:

```text
Grafana dashboard
metrics
logs
traces
correlation
```

## Demo 5 — Autoscaling

Show:

```text
k6 load
CPU rise
HPA scaling
pod count changes
```

## Demo 6 — Chaos

Break a service intentionally.

Show:

```text
failure
telemetry
alert
recovery
```

## Demo 7 — AIOps

Break the application with a known failure.

Ask:

```text
"Why is order-service slow?"
```

Show the agent:

```text
gather evidence
correlate deployment + metrics + logs
identify likely cause
select approved remediation
execute
verify
write audit record
```

This should be the main showcase demonstration.

---

# 31. Technologies We Intentionally Avoid Initially

The project should remain focused and should not become a collection of resume keywords.

Do not add these initially:

```text
Istio
Linkerd
Kafka
Vault
Crossplane
Pulumi
Flux
GitLab CI
GitHub Actions in parallel with Jenkins
Multiple Kubernetes clusters
Multi-region architecture
Multi-cloud architecture
GPU inference
Large-scale model hosting
```

A tool can be added later only when it solves a real problem or supports a deliberate learning objective.

---

# 32. Engineering Principles for the Project

1. **Local-first development** — build and debug locally before using Azure.
2. **Cloud only when it adds learning value** — do not pay for resources that do not teach anything new.
3. **Every technology needs a reason** — no technology for resume decoration.
4. **CI and CD remain separate concerns** — Jenkins builds; Argo CD reconciles.
5. **Observability before AIOps** — AI must consume real telemetry.
6. **Runbooks before autonomy** — define deterministic operational knowledge first.
7. **Least privilege for automation** — AI should have narrowly-scoped tools.
8. **Verification after remediation** — no “action taken” without evidence of recovery.
9. **Deliberate failure engineering** — create incidents instead of waiting for accidental ones.
10. **Document decisions** — explain architecture tradeoffs with ADRs.
11. **Measure everything that matters** — latency, errors, throughput, queue depth, resource use, and recovery.
12. **Prefer simple architecture until complexity is justified**.

---

# 33. Definition of Done

The project is considered complete when all of the following are true:

## Application

- [ ] E-commerce flow works end-to-end.
- [ ] Services communicate over REST and messaging.
- [ ] PostgreSQL, Redis, and RabbitMQ are integrated.
- [ ] Services expose health/readiness endpoints.
- [ ] Logs are structured.

## Containers

- [ ] Every service has a production-style Dockerfile.
- [ ] Images run as non-root where practical.
- [ ] Local Docker Compose works.

## Kubernetes

- [ ] Application runs on local Kubernetes.
- [ ] Application runs on AKS.
- [ ] Probes are configured.
- [ ] Requests/limits are configured.
- [ ] RBAC is configured.
- [ ] NetworkPolicies are configured.
- [ ] PDBs are configured.
- [ ] HPA is working.
- [ ] VPA is tested.

## Terraform

- [ ] Azure infrastructure is reproducible.
- [ ] Modules are used.
- [ ] State is remote.
- [ ] Environment separation exists.
- [ ] Destroy/recreate has been tested.

## CI/CD

- [ ] Jenkins pipeline is pipeline-as-code.
- [ ] Tests run automatically.
- [ ] Security checks run automatically.
- [ ] Images are published to ACR.
- [ ] Jenkins does not directly deploy production.

## DevSecOps

- [ ] SonarQube integrated.
- [ ] Gitleaks integrated.
- [ ] Trivy integrated.
- [ ] SBOM generated.
- [ ] Secrets are externalized.
- [ ] Kubernetes RBAC follows least privilege.

## GitOps

- [ ] Helm charts exist.
- [ ] GitOps structure exists.
- [ ] Argo CD reconciles deployment state.
- [ ] Drift and rollback are demonstrated.

## Observability

- [ ] Metrics exist.
- [ ] Logs exist.
- [ ] Traces exist.
- [ ] Grafana dashboards exist.
- [ ] Alertmanager rules exist.

## Reliability

- [ ] SLOs are documented.
- [ ] Runbooks exist.
- [ ] Chaos experiments exist.
- [ ] Incident reports exist.

## AIOps

- [ ] Agent can query live telemetry.
- [ ] Agent can inspect Kubernetes health.
- [ ] Agent can correlate deployment changes.
- [ ] Agent can read runbooks.
- [ ] Agent has explicit remediation tools.
- [ ] Remediation is policy-controlled.
- [ ] Actions are logged.
- [ ] Agent verifies recovery.
- [ ] Rollback/escalation path exists.
- [ ] Final demo works end-to-end.

---

# 34. Immediate Starting Point

Do **not** start by creating AKS, installing Argo CD, or writing Terraform.

The correct starting sequence is:

```text
1. Finalize service boundaries
        ↓
2. Define API contracts
        ↓
3. Define database ownership
        ↓
4. Define domain events
        ↓
5. Define basic SLOs / SLIs
        ↓
6. Define failure scenarios
        ↓
7. Create monorepo skeleton
        ↓
8. Implement application
        ↓
9. Containerize
        ↓
10. Kubernetes
        ↓
11. Terraform / Azure
        ↓
12. Jenkins
        ↓
13. DevSecOps
        ↓
14. GitOps
        ↓
15. Observability
        ↓
16. Autoscaling
        ↓
17. Chaos
        ↓
18. AIOps
        ↓
19. Controlled remediation
```

The first milestone is therefore **Architecture & Engineering Standards**, not Kubernetes.

---

# 35. Final Project Statement

**ShopOps** is a portfolio-grade cloud-native e-commerce platform designed as a practical learning laboratory for modern DevOps and cloud engineering.

The project combines:

```text
Microservices
Docker
Kubernetes
Azure AKS
Terraform
Jenkins
DevSecOps
Helm
Argo CD
GitOps
OpenTelemetry
Prometheus
Grafana
Loki
Tempo
HPA
VPA
k6
Chaos Engineering
SRE practices
Azure-hosted LLM
AIOps
Controlled Autonomous Remediation
```

The defining feature is not the number of tools used. It is the **operational lifecycle**:

```text
Build
 → Package
 → Secure
 → Deploy
 → Observe
 → Detect
 → Diagnose
 → Remediate
 → Verify
 → Audit
```

That lifecycle is the core of the project and the core story for portfolio and interview discussions.

---

## Status

**Project concept finalized.**

Next implementation milestone: **Weekend 1 — Architecture & Engineering Standards.**
