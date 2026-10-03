# Runbook: RB-003 - Microservice CrashLoopBackOff or Unhealthy Probe

## 1. Alert Information
- **Alert Name**: `KubePodCrashLooping` / `ServiceHealthCheckFailed`
- **Severity**: Major (P2)
- **Impact**: Service is unresponsive; API Gateway returns 502 Bad Gateway or 504 Gateway Timeout.

---

## 2. Diagnosis Steps

### 2.1 Inspect Exit Code & Termination Reason
```bash
# Docker Compose
docker compose ps
docker compose logs --tail=100 <service-name>

# Kubernetes
kubectl describe pod -l app=<service-name> -n shopops
kubectl logs -l app=<service-name> -n shopops --previous
```

### Common Exit Codes
- **Exit Code 137**: Process killed by Linux OOMKiller (Out of Memory). Service exceeded its container memory cap (256MB).
- **Exit Code 1**: Uncaught exception (e.g. database schema mismatch or missing environment variable).

---

## 3. Remediation Actions

### Action 1: Handle OOMKilled
If the container was terminated by OOMKiller:
1. Temporarily increase memory limit in `docker-compose.yml` or Kubernetes manifest (e.g. from `256M` to `512M`).
2. Inspect heap dumps or memory leak traces in Grafana Tempo / Prometheus.

### Action 2: Rollback Bad Release
If triggered by a recent deployment:
```bash
# Helm / GitOps
helm rollback shopops -n shopops
```

### Action 3: Restart Failed Container
```bash
docker compose restart <service-name>
```
