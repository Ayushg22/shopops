# ADR-010: OpenTelemetry-Based Observability

## Status
Accepted

## Context
ShopOps requires clear architectural contracts to ensure a consistent distributed systems foundation and high portfolio value.

## Decision
Unified instrumentation via OpenTelemetry SDK, routing metrics to Prometheus, logs to Loki, and traces to Tempo via Grafana.

## Alternatives Considered
Evaluated monolith vs microservices, multi-database instances vs shared cluster, and direct push CI vs GitOps.

## Consequences
Enforces realistic enterprise practices, guarantees reproducibility, and maintains low cloud spend.
