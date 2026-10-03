# ADR-007: Terraform as Infrastructure Source of Truth

## Status
Accepted

## Context
Deploying cloud resources manually via cloud web consoles (ClickOps) leads to configuration drift, unreproducible environments, undocumented security loopholes, and orphan resources that incur unexpected costs. All cloud resources for ShopOps must be codified, versioned, peer-reviewed, and destroyed or recreated reliably on demand.

## Decision
We adopted **HashiCorp Terraform (>= 1.8) as the exclusive Infrastructure as Code (IaC) tool**:
1. **Repository Structure**:
   - Infrastructure configurations live in `infra/terraform/`.
   - Modularity: Reusable modules for `vnet`, `aks`, `postgres`, `redis`, `acr`, and `keyvault`.
   - Environment separation: `environments/dev/` and `environments/prod/` with distinct state backends and variable inputs (`terraform.tfvars`).
2. **State Management**:
   - Remote backend stored in Azure Blob Storage with state locking via Azure Blob Leases to prevent concurrent deployment collisions.
   - Strict `.gitignore` rules prevent local `.tfstate` and `.tfvars` containing secrets from entering source control.
3. **Execution & CI Guardrails**:
   - Pre-commit formatting: `terraform fmt -check`.
   - Static analysis: `tflint` and `checkov` for security posture assessment (no public IP exposure, enforcing TLS 1.2+).
   - Terraform Plan output must be verified before any `terraform apply` step in CI/CD.

## Alternatives Considered
1. **Azure Bicep / ARM Templates**:
   - *Pros*: Native Azure DSL, zero state file management.
   - *Cons*: Strictly proprietary to Azure. Skills and code are not transferable to multi-cloud or hybrid environments.
2. **Pulumi**:
   - *Pros*: Allows writing IaC in TypeScript.
   - *Cons*: Terraform has vastly larger enterprise community adoption, more mature module registries, and is the industry benchmark for SRE portfolio validation.

## Consequences
- **Benefits**:
  - 100% reproducible cloud infrastructure; full teardown (`terraform destroy`) enables zero cloud cost during dormant periods.
  - Predictable drift detection (`terraform plan -detailed-exitcode`).
  - Clear audit trail of infrastructure modifications in Git history.
- **Trade-offs**:
  - State file management requires securing Azure Blob storage containers with strict IAM permissions.
