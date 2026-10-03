# ADR-003: PostgreSQL Logical Database Ownership

## Status
Accepted

## Context
ShopOps requires clear architectural contracts to ensure a consistent distributed systems foundation and high portfolio value.

## Decision
Single PostgreSQL cluster hosting isolated logical databases per service to minimize cloud costs while enforcing strict architectural boundaries.

## Alternatives Considered
Evaluated monolith vs microservices, multi-database instances vs shared cluster, and direct push CI vs GitOps.

## Consequences
Enforces realistic enterprise practices, guarantees reproducibility, and maintains low cloud spend.
