# ADR-011: Chaos Engineering Approach

## Status
Accepted

## Context
ShopOps requires clear architectural contracts to ensure a consistent distributed systems foundation and high portfolio value.

## Decision
Introduce deliberate failures (pod crashes, memory leaks, latency, DB pool exhaustion) to validate autoscaling, alerting, and AIOps.

## Alternatives Considered
Evaluated monolith vs microservices, multi-database instances vs shared cluster, and direct push CI vs GitOps.

## Consequences
Enforces realistic enterprise practices, guarantees reproducibility, and maintains low cloud spend.
