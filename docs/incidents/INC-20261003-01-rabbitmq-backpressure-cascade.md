# Incident Postmortem: INC-20261003-01 - RabbitMQ Broker Connection Starvation During Flash Load

## Incident Summary
| Property | Details |
| :--- | :--- |
| **Incident ID** | INC-20261003-01 |
| **Severity** | P2 (Major Degradation) |
| **Start Time** | 2026-10-03 14:15:00 UTC |
| **End Time** | 2026-10-03 14:32:00 UTC |
| **Duration** | 17 minutes |
| **Lead Responder** | SRE Incident Commander |

---

## 1. User Impact
During the 17-minute window, approximately 120 customer checkout requests experienced prolonged latency (>5000ms), and 14 orders failed with HTTP 504 Gateway Timeout. Product browsing and login were unaffected.

---

## 2. Root Cause Analysis (5 Whys)
1. **Why did checkout requests time out?**
   - The Order Service was unable to confirm order processing within the API Gateway proxy timeout.
2. **Why was Order Service delayed?**
   - AMQP publishing threads blocked while waiting for RabbitMQ channel confirmations.
3. **Why did RabbitMQ block publishing channels?**
   - RabbitMQ tripped its memory high-watermark alarm, triggering broker-side publisher backpressure.
4. **Why did RabbitMQ hit its memory high-watermark?**
   - The unacknowledged message queue in `notification.all-events.queue` grew to >50,000 messages because the Notification Service consumer crashed due to a Redis reconnection loop.
5. **Why did the consumer crash and not recover?**
   - The consumer lacked an exponential backoff circuit breaker on Redis socket errors.

---

## 3. Incident Timeline
- **14:15 UTC**: Redis instance restarted during maintenance.
- **14:16 UTC**: Notification Service entered a high-frequency reconnect loop and died.
- **14:20 UTC**: Messages accumulated in RabbitMQ; memory crossed 80% threshold; broker throttled producers.
- **14:22 UTC**: Alertmanager triggered `RabbitMQProducerThrottled` alert.
- **14:25 UTC**: SRE responder checked Prometheus memory graph and Loki logs; restarted Notification Service.
- **14:28 UTC**: Notification Service cleared backlog at 2,000 msgs/sec.
- **14:32 UTC**: Memory alarm cleared; order latency returned to baseline (45ms). Incident resolved.

---

## 4. Action Items & Lessons Learned
| Action Item | Type | Owner | Status |
| :--- | :--- | :--- | :--- |
| Implement exponential backoff and jitter in Redis client | Prevention | Backend Team | Completed |
| Configure `x-max-length` and TTL on notification queues | Mitigation | DevOps Team | Completed |
| Add Alertmanager alert for queue backlog > 5,000 | Detection | SRE Team | Completed |
