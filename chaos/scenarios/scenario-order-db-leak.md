# Chaos Scenario: Order Service DB Pool Leak

## Objective
Simulate a production incident where `order-service` leaks database connections, triggering high latency, 5xx errors, Prometheus alert firing, and AIOps autonomous remediation.

## Injection
Run `./chaos/experiments/db-connection-exhaustion.sh`

## Expected Progression
1. Prometheus fires `DatabaseConnectionPoolSaturated`.
2. Alertmanager sends alert webhook to AIOps Agent (`http://localhost:8090/webhook/alerts`).
3. Agent queries Prometheus metrics and inspects recent Argo CD deployments.
4. Agent matches `aiops/runbooks/order-service-db-exhaustion.md`.
5. Policy Engine verifies action `rollbackDeployment` on `order-service`.
6. Agent issues rollback to stable version.
7. Verification loop confirms connection count normalization.
