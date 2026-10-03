# Runbook: Order Service Database Connection Exhaustion

## Symptoms
- Alert: `DatabaseConnectionPoolSaturated`
- 5xx errors on `/orders` checkout endpoint
- High latency on PostgreSQL pool checkout

## Diagnostic Tools
1. `query_prometheus("pg_stat_activity_count")`
2. `get_pods("shopops")`
3. `query_logs("order-service", "error connecting to database")`

## Safe Remediation
1. Verify if bad version deployed (`get_recent_deployments("order-service")`)
2. If bad version, execute `rollback_deployment("order-service")`
3. If spike in traffic, execute `scale_deployment("order-service", 4)`

## Verification
- Connection count drops below 70%
- Error rate returns to 0% for 3 minutes

## Rollback / Escalation
- If not resolved in 5 minutes, page on-call SRE.
