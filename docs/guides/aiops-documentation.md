# ShopOps: AIOps Incident Diagnosis & Controlled Remediation

This document defines the AIOps architecture, tool-calling interfaces, safety guardrails, and autonomous remediation workflows in ShopOps.

---

## 1. Architectural Philosophy
Rather than relying on unconstrained LLM bash prompts or opaque black-box scripts, ShopOps treats AIOps as a **supervised, policy-enforced control plane**:
- **Read-Only Telemetry Exploration**: Diagnostic tools have read-only access to Prometheus metrics, Loki logs, Tempo distributed traces, and Kubernetes events.
- **Strictly Typed Remediation Tools**: Remediation is restricted to explicit, parameter-validated actions with bounded blast radiuses.
- **Policy Enforcement**: Rate limits, mandatory dry-runs, and post-action verification loops prevent runaway remediation cascades.

```
+-----------------------------------------------------------------------------------+
|                        Alert Trigger (Alertmanager Webhook)                       |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                               AIOps Incident Agent                                |
|                                                                                   |
|  [ Phase 1: Telemetry Inspection (Read-Only) ]                                    |
|  - query_prometheus("rate(http_requests_total{status=~'5..'}[2m])")              |
|  - fetch_loki_logs("order-service", "level=error", "10m")                         |
|  - inspect_tempo_trace("trace-weekend4-docker-101")                               |
|                                                                                   |
|  [ Phase 2: Hypothesis & Runbook Matching ]                                       |
|  - Matches incident symptoms against docs/runbooks/                               |
|  - Formulates root-cause hypothesis (e.g., "Postgres connection pool exhausted") |
|                                                                                   |
|  [ Phase 3: Policy-Checked Remediation (Bounded Tools) ]                          |
|  - Evaluates action safety (cooldowns, blast radius caps)                         |
|  - Invokes restart_deployment("order-service", "shopops")                         |
|                                                                                   |
|  [ Phase 4: Verification & Automated Postmortem ]                                 |
|  - Verifies error rate drops back to steady state (<0.5%) within 60s               |
|  - Generates comprehensive postmortem report in docs/incidents/                    |
+-----------------------------------------------------------------------------------+
```

---

## 2. Tool Calling Specification

### 2.1 Diagnostic Tools (Read-Only)
| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `query_prometheus` | `query: string`, `timeWindow: string` | Executes PromQL queries against Prometheus API. |
| `fetch_loki_logs` | `service: string`, `pattern: string`, `limit: number` | Searches LogQL patterns in Loki log streams. |
| `inspect_tempo_trace` | `traceId: string` | Retrieves span waterfall and latency bottlenecks from Tempo. |
| `get_k8s_events` | `namespace: string`, `type?: string` | Fetches Kubernetes Warning events (`OOMKilled`, `CrashLoopBackOff`). |

### 2.2 Remediation Tools (Bounded Actions)
| Tool Name | Parameters | Allowed Boundaries / Constraints |
| :--- | :--- | :--- |
| `restart_deployment` | `deployment: string`, `namespace: string` | Max 1 restart per deployment per 60 minutes. |
| `scale_replicas` | `deployment: string`, `replicas: number`, `namespace: string` | Min: 1, Max: 5. Cannot scale to 0. |
| `purge_dead_letter_queue` | `queueName: string` | Dumps payload to blob storage before clearing queue. |
| `rollback_release` | `release: string`, `namespace: string` | Reverts to immediately preceding stable Helm revision. |

---

## 3. Incident Remediation Verification Loop
After invoking any remediation tool:
1. Agent enters a 30-second stabilization wait.
2. Re-queries the alert metric:
   - If metric recovers below threshold: marks incident **RESOLVED** and generates postmortem.
   - If metric fails to recover within 120 seconds: triggers automated rollback and pages human SRE on-call via Escalation webhook.
