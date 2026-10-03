# ADR-011: Chaos Engineering Approach

## Status
Accepted

## Context
Traditional systems testing only verifies happy-path functionality under pristine conditions. In real production environments, networks drop packets, cloud disks throttle IOPS, database connections saturate during flash sales, and third-party payment gateways experience intermittent 504 gateway timeouts. To validate SRE resilience, Alertmanager alerting, and automated AIOps self-healing, we must deliberately and safely inject real-world faults.

## Decision
We adopted a **Controlled Hypothesis-Driven Chaos Engineering Framework**:
1. **Target Fault Injections**:
   - **Network Chaos**: Artificial packet latency (200ms-2000ms), packet corruption, and network partitions between microservices.
   - **Pod / Process Chaos**: Spontaneous pod kills, SIGKILL on Node.js workers, and container crashloop backoffs.
   - **Resource Stress**: CPU burn (100% core saturation) and memory leaks (simulating memory exhaustion to trigger Linux OOMKiller).
   - **Broker & Database Chaos**: RabbitMQ broker disconnection, connection pool exhaustion, and slow Postgres queries.
2. **Execution Engine**:
   - In local Kubernetes / AKS: **Chaos Mesh** or **LitmusChaos** CRDs to codify chaos experiments as declarative YAML.
   - Application-level failure flags: Injected via HTTP headers or environment variables for deterministic chaos in integration tests.
3. **Safety & Blast Radius Guardrails**:
   - Every experiment defines:
     - *Hypothesis*: "When inventory-service latency increases by 500ms, API Gateway circuit breaker trips, orders fail gracefully with 429/503 within 300ms, and Alertmanager fires `HighLatencyAlert` within 60s."
     - *Steady-State Metric*: Synthetic order success rate >= 99.0%.
     - *Automatic Abort Trigger*: If global error rate exceeds 5% for >30s, the chaos experiment immediately terminates.

## Alternatives Considered
1. **Manual Ad-hoc Debugging (`kill -9`, `docker stop`)**:
   - *Pros*: Simple, no extra tools.
   - *Cons*: Uncontrolled, unmeasured, and unreproducible. Does not test automated recovery or validate observability alerts systematically.
2. **Production-Only Chaos (Netflix Chaos Monkey style)**:
   - *Pros*: Ultimate reality check.
   - *Cons*: Irresponsible and catastrophic for early stages or environments lacking mature automated rollbacks and circuit breakers. Controlled staging/dev cluster chaos is required first.

## Consequences
- **Benefits**:
  - Proves that alerts fire accurately and that runbooks work before a genuine customer-impacting outage occurs.
  - Validates graceful degradation (e.g. circuit breakers trip, degraded UI banners appear, orders queue safely in RabbitMQ).
  - Supplies the telemetry anomalies required to train and validate AIOps incident triage agents.
- **Trade-offs**:
  - Requires dedicated staging test runs and synthetic load generators (`k6` or `Locust`) during chaos execution.
