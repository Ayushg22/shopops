# ShopOps Infrastructure as Code (Terraform)

Manages all Azure cloud infrastructure declaratively using Terraform.

## Directory Structure
- `modules/`: Reusable infrastructure building blocks
  - `network/`: VNet, subnets, NSGs
  - `aks/`: Azure Kubernetes Service cluster and node pools
  - `postgres/`: Azure PostgreSQL Flexible Server
  - `acr/`: Azure Container Registry
  - `keyvault/`: Key Vault and Secret store
  - `monitoring/`: Azure Log Analytics and Azure Monitor
- `environments/`: Environment instantiations
  - `dev/`: Development environment state and variables
  - `prod/`: Production environment state and variables

## Usage
```bash
cd environments/dev
terraform init
terraform plan
terraform apply
```
