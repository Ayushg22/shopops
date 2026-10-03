# ADR-010: OpenTelemetry-Based Observability

## Status
Accepted

## Context
Troubleshooting distributed microservices without unified telemetry is notoriously difficult. When an order fails or experiences 5-second latency, logs in individual services without correlation IDs cannot reveal whether the bottleneck was in the API Gateway, Order Service database queries, RabbitMQ delivery, or Payment processing. Proprietary APM vendors (Datadog, Dynatrace, New Relic) introduce vendor lock-in and high licensing costs.

## Decision
We adopted the **OpenTelemetry (OTel) CNCF Standard for Unified Metrics, Logs, and Traces**:
1. **Instrumented Application Tier (`@shopops/observability`)**:
   - Every microservice imports `@shopops/observability` and initializes the OTel NodeSDK before loading any application modules.
   - Auto-instrumentation for HTTP, Express, Prisma, Redis, and AMQP.
   - W3C Trace Context propagation across HTTP headers (`traceparent`, `tracestate`) and RabbitMQ message headers.
   - Distributed correlation ID (`x-correlation-id`) injected into all structured Winston logs (`@shopops/logger`) and attached to active OTel spans as attributes.
2. **OpenTelemetry Collector Architecture**:
   - Central `otel-collector` container receiving OTLP over gRPC (`4317`) and HTTP (`4318`).
   - Pipelines:
     - Traces -> Exported to **Grafana Tempo** (distributed tracing store).
     - Metrics -> Scraped by **Prometheus** via `/metrics` exporter.
     - Logs -> Forwarded to **Grafana Loki** with structured label indexing (`service_name`, `level`, `trace_id`).
3. **Visualization & Alerting**:
   - **Grafana**: Unified dashboards linking metrics to traces (via Tempo) and traces to logs (via Loki traceQL).
   - **Alertmanager**: Evaluates Prometheus alerting rules for SLI/SLO breaches (error budgets, latency p99 > 500ms).

## Alternatives Considered
1. **Prometheus-Only Metrics with Standalone Winston File Logs**:
   - *Pros*: Familiar and quick to set up.
   - *Cons*: Zero distributed tracing. You cannot follow a single customer's transaction across 4 microservice hops.
2. **Proprietary Vendor Agent (Datadog)**:
   - *Pros*: Out-of-the-box dashboards.
   - *Cons*: Severe vendor lock-in and ongoing per-host/per-log SaaS subscription bills. OpenTelemetry ensures 100% vendor neutrality.

## Consequences
- **Benefits**:
  - Full end-to-end request visualization across asynchronous message boundaries.
  - Seamless jump from a high-latency Prometheus graph directly to the exact slow database trace in Tempo and the corresponding error log in Loki.
  - 100% open-source, portable to any cloud provider or on-premise cluster.
- **Trade-offs**:
  - Requires maintaining the observability pipeline containers (Tempo, Loki, Prometheus, OTel Collector) in local development and cluster deployments (~600MB combined memory footprint).
