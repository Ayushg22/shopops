# ADR-005: RabbitMQ Event Strategy

## Status
Accepted

## Context
Asynchronous event-driven communication requires a robust broker topology, message routing strategy, error handling mechanism, and idempotency contract. Unstructured queue definitions lead to lost messages, poison pill message loops that crash workers indefinitely, and unroutable deadlocks.

## Decision
We adopted **RabbitMQ 3.13 with a Topic Exchange and Dead-Letter Queue (DLQ) Architecture**:
1. **Exchange Topology**:
   - Single durable Topic Exchange: `shopops.events`.
   - Routing Keys follow domain noun-verb conventions:
     - `order.created`: Published by `order-service` when a new order is received.
     - `inventory.reserved`: Published by `inventory-service` after stock holds are secured.
     - `inventory.insufficient`: Published by `inventory-service` when stock is depleted.
     - `payment.completed`: Published by `payment-service` upon successful charge authorization.
     - `payment.failed`: Published by `payment-service` upon transaction decline or gateway timeout.
2. **Queue Isolation & Binding**:
   - Each consumer service maintains its own durable queue:
     - `inventory.order-created.queue` bound to `order.created`.
     - `payment.inventory-reserved.queue` bound to `inventory.reserved`.
     - `order.payment-completed.queue` bound to `payment.completed`.
     - `notification.all-events.queue` bound to `*.#` (catches all events for customer notification processing).
3. **Poison Message Handling & Dead-Letter Exchanges**:
   - All queues configure `x-dead-letter-exchange: shopops.events.dlx` and `x-dead-letter-routing-key: dead-letter`.
   - Failed messages after max retry attempts (3 retries with exponential backoff) are rejected (`nack(false)`) and routed to `shopops.events.dlq` for SRE inspection rather than crashing consumer processes.
4. **Message Schema Standard**:
   - Every message payload conforms to `DomainEvent<T>` defined in `@shopops/shared-types`:
     - `eventId` (UUIDv4)
     - `eventType` (string)
     - `timestamp` (ISO-8601 string)
     - `correlationId` (UUIDv4 for distributed trace stitching)
     - `data` (Domain entity payload)
   - Consumers implement idempotency checks using event IDs to guarantee safe handling of at-least-once message delivery.

## Alternatives Considered
1. **Apache Kafka**:
   - *Pros*: High partition-based throughput, distributed commit log replay.
   - *Cons*: Extremely heavy resource footprint (JVM, ZooKeeper/KRaft), slow local container startup, and complex partition rebalancing. RabbitMQ is lightweight (<50MB RAM), fast, and ideal for task queues and enterprise AMQP routing.
2. **Redis Pub/Sub**:
   - *Pros*: Extremely lightweight and already in stack.
   - *Cons*: Pub/Sub is fire-and-forget without persistence, message acknowledgments, or durable dead-letter handling. If a worker is restarting, messages are permanently lost.

## Consequences
- **Benefits**:
  - Independent consumer scaling without queue conflicts.
  - Guaranteed message durability across broker restarts (`durable: true`, `persistent: 2`).
  - Correlation ID preservation allows end-to-end tracing across distributed message hops in Tempo and Jaeger.
- **Trade-offs**:
  - Requires maintaining connection health and reconnection logic in Node.js consumers (`amqplib`).
