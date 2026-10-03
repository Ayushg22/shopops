# ADR-012: AIOps Tool-Based Controlled Remediation

## Status
Accepted

## Context
Modern SRE teams face alert fatigue from hundreds of firing alerts during complex incidents. While Large Language Models (LLMs) and AI agents show tremendous promise for root-cause analysis and incident triage, granting an unconstrained autonomous AI direct root shell access (`sudo`, unrestricted `kubectl`) to production infrastructure is an unacceptable security and operational catastrophe waiting to happen.

## Decision
We adopted a **Controlled, Least-Privilege, Tool-Based AIOps Architecture**:
1. **Four-Phase Autonomous Incident Lifecycle**:
   - **Detect**: Webhook ingestion from Alertmanager / Prometheus when an SLO breach occurs.
   - **Diagnose**: AI agent queries telemetry through read-only tools:
     - `query_prometheus(promql)`
     - `fetch_loki_logs(service, time_window, pattern)`
     - `inspect_tempo_trace(trace_id)`
     - `get_k8s_events(namespace)`
   - **Propose & Verify**: Agent correlates telemetry, identifies root cause, matches against codified operational runbooks (`docs/runbooks/`), and proposes a remediation plan.
   - **Remediate**: Agent executes actions exclusively through strictly bounded, auditable, parameter-validated remediation tools:
     - `restart_deployment(deployment_name, namespace)`
     - `scale_replicas(deployment_name, replicas, namespace)`
     - `rollback_release(helm_release, namespace)`
     - `flush_dead_letter_queue(queue_name)`
2. **Safety & Policy Guardrails**:
   - Remediation actions require policy verification: rate limits on restarts (max 1 restart per service per hour), blast-radius caps (cannot scale to 0), and mandatory rollback if steady-state metrics do not recover within 120 seconds.
   - Complete audit trail of LLM rationale, raw telemetry inspected, and tool execution logs archived into incident postmortems (`docs/incidents/`).

## Alternatives Considered
1. **Unbounded Bash Shell Agent**:
   - *Pros*: Agent can theoretically do anything.
   - *Cons*: Catastrophic security hazard. An hallucinating or prompt-injected LLM could execute `rm -rf`, delete databases, or expose customer secrets. Strongly rejected.
2. **Human-in-the-Loop Only (No Autonomous Execution)**:
   - *Pros*: Safe.
   - *Cons*: Fails to demonstrate true AIOps self-healing and automated MTTR reduction under controlled scenarios. Bounded tools provide the exact balance of autonomy and safety.

## Consequences
- **Benefits**:
  - Dramatic reduction in Mean Time to Detect (MTTD) and Mean Time to Remediate (MTTR).
  - Eliminates human panic and manual typos during 2 AM on-call triage.
  - Zero risk of destructive shell commands due to strictly typed function calling APIs.
- **Trade-offs**:
  - Every automated remediation action must be explicitly implemented, tested, and guarded by policy rules in the AIOps controller.
