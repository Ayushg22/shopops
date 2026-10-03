# ADR-009: Argo CD for GitOps CD

## Status
Accepted

## Context
ShopOps requires clear architectural contracts to ensure a consistent distributed systems foundation and high portfolio value.

## Decision
Argo CD reconciles Kubernetes state from Git repository manifests; Jenkins does not deploy directly with kubectl apply.

## Alternatives Considered
Evaluated monolith vs microservices, multi-database instances vs shared cluster, and direct push CI vs GitOps.

## Consequences
Enforces realistic enterprise practices, guarantees reproducibility, and maintains low cloud spend.
