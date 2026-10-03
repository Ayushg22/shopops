# ShopOps: Asynchronous Event Flows & RabbitMQ Topology

## 1. Broker Topology & Standards
- **Broker**: RabbitMQ 3.13 (Erlang/OTP)
- **Primary Exchange**: `shopops.events`
  - Type: `topic`
  - Durable: `true`
  - Auto-Delete: `false`
- **Dead-Letter Exchange (DLX)**: `shopops.events.dlx`
  - Type: `direct`
  - Routing Key: `dead-letter`
- **Dead-Letter Queue (DLQ)**: `shopops.events.dlq`
  - Captures poison messages after 3 failed processing attempts.

---

## 2. Event Choreography Sequence (Order Checkout Saga)

```
[Client / UI]
     |
     | 1. POST /api/v1/orders
     v
[Order Service] -------- (Persists Order with status: PENDING)
     |
     | 2. Publishes: order.created
     v
[shopops.events Exchange]
     |
     +-----------------------------------> [Inventory Service]
     |                                             |
     |                                             | 3. Checks stock:
     |                                             |    - Decrements availableQuantity
     |                                             |    - Increments reservedQuantity
     |                                             v
     |                                    [shopops.events Exchange]
     |                                             |
     |                                             | 4. Publishes: inventory.reserved
     |                                             v
     +-----------------------------------> [Payment Service]
     |                                             |
     |                                             | 5. Authorizes charge:
     |                                             |    - Generates transactionRef
     |                                             v
     |                                    [shopops.events Exchange]
     |                                             |
     |                                             | 6. Publishes: payment.completed
     |                                             v
     +-----------------------------------> [Order Service]
     |                                             |
     |                                             | 7. Updates status to: COMPLETED
     |                                             v
     +-----------------------------------> [Notification Service]
                                                   |
                                                   | 8. Stores notification in Redis
                                                   v
                                            [Redis: inbox:<customerId>]
```

---

## 3. Event Catalog & Payload Specifications

### 3.1 `order.created`
- **Publisher**: `order-service`
- **Routing Key**: `order.created`
- **Consumers**: `inventory-service`, `notification-service`
- **Schema**:
```json
{
  "eventId": "b9669dc4-17a4-4f0e-b9b8-04358a9e6231",
  "eventType": "order.created",
  "timestamp": "2026-10-03T20:25:58.517Z",
  "correlationId": "trace-weekend4-docker-101",
  "data": {
    "orderId": "9d320701-b6ea-437d-88a9-584198b91d92",
    "customerId": "docker-verified-customer",
    "totalAmount": 899.97,
    "items": [
      {
        "productId": "e59756ab-7077-4c7c-8a1d-523135740a87",
        "quantity": 3,
        "unitPrice": 299.99
      }
    ]
  }
}
```

### 3.2 `inventory.reserved`
- **Publisher**: `inventory-service`
- **Routing Key**: `inventory.reserved`
- **Consumers**: `payment-service`, `notification-service`
- **Schema**:
```json
{
  "eventId": "f1837882-6284-482a-a92c-747372991038",
  "eventType": "inventory.reserved",
  "timestamp": "2026-10-03T20:25:58.530Z",
  "correlationId": "trace-weekend4-docker-101",
  "data": {
    "orderId": "9d320701-b6ea-437d-88a9-584198b91d92",
    "customerId": "docker-verified-customer",
    "totalAmount": 899.97
  }
}
```

### 3.3 `inventory.insufficient` (Negative Compensation)
- **Publisher**: `inventory-service`
- **Routing Key**: `inventory.insufficient`
- **Consumers**: `order-service`, `notification-service`
- **Effect**: `order-service` marks order `FAILED`; customer receives out-of-stock notification.

### 3.4 `payment.completed`
- **Publisher**: `payment-service`
- **Routing Key**: `payment.completed`
- **Consumers**: `order-service`, `inventory-service`, `notification-service`
- **Schema**:
```json
{
  "eventId": "e9381710-8274-4b47-9201-447192801938",
  "eventType": "payment.completed",
  "timestamp": "2026-10-03T20:25:58.550Z",
  "correlationId": "trace-weekend4-docker-101",
  "data": {
    "orderId": "9d320701-b6ea-437d-88a9-584198b91d92",
    "paymentId": "5fae7102-4418-490b-932d-209418291039",
    "transactionRef": "tx-1791059158587-GSSEU3",
    "status": "SUCCESS"
  }
}
```

### 3.5 `payment.failed` (Negative Compensation)
- **Publisher**: `payment-service`
- **Routing Key**: `payment.failed`
- **Consumers**: `order-service`, `inventory-service`, `notification-service`
- **Effect**: `inventory-service` releases reserved stock (`RELEASED`); `order-service` marks order `FAILED`.

---

## 4. Idempotency & Delivery Guarantees
- **At-Least-Once Delivery**: RabbitMQ provides at-least-once delivery semantics.
- **Deduplication**: Consumers use the unique `eventId` and `correlationId` to ensure repeated delivery of identical messages does not trigger duplicate charges or double stock deductions.
- **Consumer Acknowledgments**: Consumers process the message inside a transactional unit and issue `channel.ack(msg)` only after state mutation succeeds. Unhandled exceptions trigger `channel.nack(msg, false, false)` which forwards the message to `shopops.events.dlq`.
