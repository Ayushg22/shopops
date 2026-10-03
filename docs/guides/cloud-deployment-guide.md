# ShopOps: Cloud Deployment Guide (Azure & AKS)

This document outlines the cloud infrastructure topology, Terraform provisioning, and AKS deployment strategy for ShopOps.

---

## 1. Cloud Architecture Blueprint

```
+-----------------------------------------------------------------------------------------+
|                                Microsoft Azure (East US)                                |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  |                             Virtual Network (VNet)                                |  |
|  |                                                                                   |  |
|  |  +---------------------------+   +---------------------------------------------+  |  |
|  |  |   Public Gateway Subnet   |   |            AKS Node Pool Subnet             |  |  |
|  |  | - Azure Application GW /  |   | - 2x Standard_D2s_v5 VMs                    |  |  |
|  |  |   Ingress Controller      |   | - ShopOps Microservices Pods                |  |  |
|  |  | - TLS 1.3 Termination     |   | - Prometheus / Loki / Tempo Pods            |  |  |
|  |  +-------------+-------------+   +----------------------+----------------------+  |  |
|  |                |                                        |                         |  |
|  |                +----------------------------------------+                         |  |
|  |                                                         |                         |  |
|  |  +------------------------------------------------------+----------------------+  |  |
|  |  |                          Database & Cache Subnet (Private)                  |  |  |
|  |  | - Azure Database for PostgreSQL Flexible Server                             |  |  |
|  |  | - Azure Cache for Redis (Standard Tier)                                     |  |  |
|  |  +-----------------------------------------------------------------------------+  |  |
|  +-----------------------------------------------------------------------------------+  |
|                                                                                         |
|  +-------------------------------------+   +-----------------------------------------+  |
|  | Azure Container Registry (ACR)      |   | Azure Key Vault (Secrets Management)    |  |
|  | - Private, Geo-replicated           |   | - AKS Workload Identity Integration     |  |
|  +-------------------------------------+   +-----------------------------------------+  |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Infrastructure as Code (Terraform)
All infrastructure is declared under `infra/terraform/`.

### Directory Layout
```text
infra/terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   └── prod/
└── modules/
    ├── vnet/
    ├── aks/
    ├── postgres/
    ├── redis/
    ├── acr/
    └── keyvault/
```

### Deployment Commands
```bash
cd infra/terraform/environments/dev
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

---

## 3. Kubernetes Deployment via Helm
Once AKS is provisioned:
1. Connect `kubectl` to the AKS cluster:
   ```bash
   az aks get-credentials --resource-group rg-shopops-dev --name aks-shopops-dev
   ```
2. Install the Nginx Ingress Controller or Azure App Gateway Ingress:
   ```bash
   helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
   helm repo update
   helm install nginx-ingress ingress-nginx/ingress-nginx --namespace ingress-basic --create-namespace
   ```
3. Deploy the ShopOps Helm Chart:
   ```bash
   helm upgrade --install shopops ./helm/shopops --namespace shopops --create-namespace -f ./helm/shopops/values-dev.yaml
   ```

---

## 4. Cost Optimization & Budget Guardrails
- **Cluster Autoscaling**: Node pools configure min nodes `1`, max nodes `3`.
- **Spot Instances**: Dev workloads leverage Azure Spot VMs where possible.
- **Teardown**: Automated teardown scripts (`terraform destroy`) run at the end of load test cycles to prevent unnecessary cloud expenditure.
