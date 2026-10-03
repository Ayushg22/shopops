# ADR-012: AIOps Tool-Based Controlled Remediation

## Status
Accepted

## Context
ShopOps requires clear architectural contracts to ensure a consistent distributed systems foundation and high portfolio value.

## Decision
Autonomous remediation agent backed by Azure LLM with explicit tools and strict policy guardrails. No unrestricted shell access.

## Alternatives Considered
Evaluated monolith vs microservices, multi-database instances vs shared cluster, and direct push CI vs GitOps.

## Consequences
Enforces realistic enterprise practices, guarantees reproducibility, and maintains low cloud spend.
