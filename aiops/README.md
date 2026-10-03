# ShopOps AIOps Controlled Autonomous Remediation

Autonomous incident response agent backed by LLM tool calling with least-privilege guardrails.

## Capabilities
- **Observe**: Collect live Kubernetes states, Prometheus metrics, and Loki logs.
- **Recommend**: Cross-reference active alerts with incident runbooks.
- **Remediate**: Execute policy-governed operational actions (`restart`, `rollback`, `scale`).
- **Verify**: Continuously monitor post-action telemetry to confirm resolution.
- **Audit**: Log every decision, evidence artifact, and result.
