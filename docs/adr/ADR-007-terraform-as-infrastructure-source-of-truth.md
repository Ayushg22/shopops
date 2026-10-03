# ADR-007: Terraform as Infrastructure Source of Truth

## Status
Accepted

## Context
ShopOps requires clear architectural contracts to ensure a consistent distributed systems foundation and high portfolio value.

## Decision
All Azure resources defined declaratively via reusable Terraform modules.

## Alternatives Considered
Evaluated monolith vs microservices, multi-database instances vs shared cluster, and direct push CI vs GitOps.

## Consequences
Enforces realistic enterprise practices, guarantees reproducibility, and maintains low cloud spend.
