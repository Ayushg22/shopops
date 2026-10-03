# ADR-004: REST vs Asynchronous Messaging

## Status
Accepted

## Context
ShopOps requires clear architectural contracts to ensure a consistent distributed systems foundation and high portfolio value.

## Decision
Synchronous REST for queries and immediate client mutations; RabbitMQ events for multi-service business transactions.

## Alternatives Considered
Evaluated monolith vs microservices, multi-database instances vs shared cluster, and direct push CI vs GitOps.

## Consequences
Enforces realistic enterprise practices, guarantees reproducibility, and maintains low cloud spend.
