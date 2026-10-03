# ADR-001: Overall System Architecture

## Status
Accepted

## Context
ShopOps requires clear architectural contracts to ensure a consistent distributed systems foundation and high portfolio value.

## Decision
Monorepo with 7 microservices + frontend, event-driven async processing via RabbitMQ, logical PostgreSQL database-per-service.

## Alternatives Considered
Evaluated monolith vs microservices, multi-database instances vs shared cluster, and direct push CI vs GitOps.

## Consequences
Enforces realistic enterprise practices, guarantees reproducibility, and maintains low cloud spend.
