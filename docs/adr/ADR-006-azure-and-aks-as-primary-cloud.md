# ADR-006: Azure and AKS as Primary Cloud

## Status
Accepted

## Context
ShopOps requires a production-grade cloud environment to demonstrate enterprise SRE operations, managed Kubernetes orchestration, infrastructure as code, automated continuous deployment, and realistic cloud telemetry. The cloud provider must offer managed Kubernetes, enterprise identity integration, managed database options, and predictable, cost-optimized tiering for educational and portfolio demonstration.

## Decision
We selected **Microsoft Azure and Azure Kubernetes Service (AKS)** as the primary cloud hosting platform:
1. **Managed Kubernetes (AKS)**:
   - System node pool with burstable B-series or D-series VMs (`Standard_D2s_v5` or `Standard_B2s`).
   - Azure CNI or Kubenet networking with Azure Network Policy.
   - Azure Managed Prometheus and Azure Monitor Container Insights integration.
2. **Infrastructure Boundaries**:
   - Primary Region: `East US` or `Central US` (high service availability and lowest pricing).
   - Resource Group Isolation: `rg-shopops-dev`, `rg-shopops-prod`.
   - Azure Container Registry (ACR) for private, secure container image distribution.
3. **Managed Services Alignment**:
   - Azure Database for PostgreSQL Flexible Server for managed data tier.
   - Azure Cache for Redis for managed cache tier.
   - Azure Key Vault for hardware-backed secret storage with AKS Workload Identity.

## Alternatives Considered
1. **AWS (EKS)**:
   - *Pros*: Market share leader.
   - *Cons*: Higher baseline control plane cost ($0.10/hour per cluster ~$73/month just for the control plane), whereas AKS offers a free tier cluster management fee, significantly reducing personal lab spend.
2. **Google Cloud Platform (GKE)**:
   - *Pros*: Excellent native Kubernetes experience (Autopilot).
   - *Cons*: Azure provides stronger native enterprise Active Directory/Entra ID integration and widespread adoption in Fortune 500 corporate IT landscapes relevant to enterprise SRE roles.

## Consequences
- **Benefits**:
  - Zero cluster management fee on AKS Free Tier saves significant cloud operational expenses.
  - Native integration with Terraform AzureRM provider and Azure CLI.
  - Workload Identity allows Kubernetes ServiceAccounts to access Azure Key Vault without storing credentials in Git.
- **Trade-offs**:
  - Azure CNI requires careful VNet subnet IP pre-allocation to prevent IP exhaustion.
