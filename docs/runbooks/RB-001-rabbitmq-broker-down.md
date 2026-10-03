# Runbook: RB-001 - RabbitMQ Broker Unreachable or Down

## 1. Alert Information
- **Alert Name**: `RabbitMQDown` / `RabbitMQNodeNotReady`
- **Severity**: Critical (P1)
- **Impact**: Order state transitions fail to propagate. Orders remain in `PENDING` state. Stock reservations and payments halt.

---

## 2. Diagnosis Steps

### 2.1 Check Broker Health
```bash
# Docker Compose
docker compose ps rabbitmq
docker compose logs rabbitmq --tail=50

# Kubernetes
kubectl get pods -n shopops -l app=rabbitmq
kubectl describe pod -n shopops -l app=rabbitmq
```

### 2.2 Verify AMQP Port Connectivity
```bash
nc -zv localhost 5672 || nc -zv rabbitmq 5672
```

### 2.3 Check Consumer Connection Logs
Check if microservices are retrying connections:
```bash
docker compose logs order-service | grep -i "rabbitmq"
```

---

## 3. Remediation Actions

### Action 1: Restart Broker Container / Pod
```bash
# Docker Compose
docker compose restart rabbitmq

# Kubernetes
kubectl rollout restart statefulset/rabbitmq -n shopops
```

### Action 2: Verify Exchange and Queue Declaration
Open RabbitMQ Management UI (`http://localhost:15672` user: `guest`, pass: `guest`) and verify:
- Exchange `shopops.events` exists.
- Queues are bound and messages are flowing.

### Action 3: Verify Microservice Reconnection
Microservices implement automatic reconnection via `amqplib`. Once the broker reports healthy:
```bash
curl http://localhost:8003/health/ready
```
Ensure readiness probes return `UP`.
