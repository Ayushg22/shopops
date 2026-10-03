# ADR-006: Azure + AKS as Primary Cloud

## Status
Accepted

## Context
ShopOps requires clear architectural contracts to ensure a consistent distributed systems foundation and high portfolio value.

## Decision
Azure Kubernetes Service (AKS) as target production orchestrator, utilizing Azure free credits with destroy-on-idle discipline.

## Alternatives Considered
Evaluated monolith vs microservices, multi-database instances vs shared cluster, and direct push CI vs GitOps.

## Consequences
Enforces realistic enterprise practices, guarantees reproducibility, and maintains low cloud spend.
