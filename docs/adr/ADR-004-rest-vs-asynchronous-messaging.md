# ADR-004: REST vs Asynchronous Messaging

## Status
Accepted

## Context
In a distributed e-commerce architecture, services need to communicate to complete business operations. Using exclusively synchronous HTTP/REST calls creates tight temporal coupling, latency amplification, and cascading failures: if the Payment Service or Notification Service encounters a 3-second delay, the user's checkout request hangs and downstream worker threads exhaust connection pools. Conversely, using asynchronous messaging for everything (such as user login or catalog browsing) creates unnecessary complexity and poll-based UI latency.

## Decision
We established a strict **Dual-Mode Communication Protocol**:
1. **Synchronous REST (HTTP/JSON) for Command/Query Client Interactions**:
   - Used where the caller requires an immediate response to proceed.
   - Examples: User login / token generation (`POST /api/v1/auth/login`), Product catalog browsing (`GET /api/v1/products`), User order history retrieval (`GET /api/v1/orders`), Health checks (`GET /health/live`, `GET /health/ready`).
   - Standardized envelope format: `ApiResponse<T>` with status code, data, error details, and correlation ID.
2. **Asynchronous Messaging (AMQP / RabbitMQ) for State-Mutating Business Workflows**:
   - Used for distributed sagas and state changes that trigger side effects across multiple services.
   - Examples: Order placement immediately returns `201 Accepted` (status: `PENDING`) and emits `order.created`. Inventory reservation, payment processing, order status transition to `COMPLETED`, and customer notification delivery execute asynchronously over message queues.

## Alternatives Considered
1. **Purely Synchronous REST for the Entire Checkout Flow**:
   - *Pros*: Simple mental model; single linear stack trace.
   - *Cons*: Highly brittle. If Notification Service fails or hangs, checkout crashes or times out. Cannot handle traffic spikes or backpressure.
2. **gRPC for Internal Synchronous Communication**:
   - *Pros*: Binary protocol buffers, lower serialization overhead.
   - *Cons*: Additional complexity in schema compilation, browser inspection friction, and reduced visibility in standard HTTP reverse proxies for initial phases. Standard HTTP/1.1 REST is sufficient for current throughput and provides superior debugging visibility.

## Consequences
- **Benefits**:
  - Resilient checkout: the platform accepts orders even if downstream workers (payment, notifications) are under heavy load or momentarily restarting.
  - Decoupled development: services subscribe to events without modifying the emitting service's codebase.
  - Predictable API latency for client interactions.
- **Trade-offs**:
  - Requires handling eventual consistency (orders display `PENDING` briefly before transitioning to `COMPLETED`).
  - Frontend or client must poll or listen to WebSocket/SSE for real-time status updates.
