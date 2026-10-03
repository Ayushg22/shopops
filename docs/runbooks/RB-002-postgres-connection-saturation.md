# Runbook: RB-002 - PostgreSQL Connection Saturation

## 1. Alert Information
- **Alert Name**: `PostgresConnectionPoolExhausted` / `HighDatabaseLatency`
- **Severity**: Major (P2)
- **Impact**: Database queries timeout; HTTP endpoints return 500 or 504 errors.

---

## 2. Diagnosis Steps

### 2.1 Inspect Active Connections
Connect to PostgreSQL container:
```bash
docker exec -it shopops-postgres psql -U shopops -d shopops_order -c "
SELECT datname, count(*) 
FROM pg_stat_activity 
GROUP BY datname;"
```

### 2.2 Identify Long-Running or Blocked Queries
```bash
docker exec -it shopops-postgres psql -U shopops -d shopops_order -c "
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds'
AND state != 'idle';"
```

---

## 3. Remediation Actions

### Action 1: Terminate Runaway Query PIDs
```bash
docker exec -it shopops-postgres psql -U shopops -d shopops_order -c "SELECT pg_terminate_backend(<pid>);"
```

### Action 2: Restart Affected Microservice to Reset Prisma Connection Pool
```bash
# Docker Compose
docker compose restart order-service

# Kubernetes
kubectl rollout restart deployment/order-service -n shopops
```

### Action 3: Adjust Connection Pool Configuration
Tune `connection_limit` in the service `DATABASE_URL` (e.g. `?schema=public&connection_limit=10`).
