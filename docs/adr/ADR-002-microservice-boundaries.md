# ADR-002: Microservice Boundaries

## Status
Accepted

## Context
When decomposing an e-commerce platform into microservices, poorly chosen boundaries lead to distributed monolith anti-patterns: excessive synchronous remote calls, circular runtime dependencies, shared transactional state, and tight coupling during schema updates. We required clear bounded contexts aligned with Domain-Driven Design (DDD).

## Decision
We established six distinct domain boundaries, each encapsulated in its own independently deployable microservice:
1. **Identity & Access Management (`auth-service`)**:
   - Boundary: User registration, credential hashing (bcrypt), JWT issuance, and RBAC claims.
   - Isolation: Owns `shopops_auth` DB. Zero knowledge of product catalog or shopping carts.
2. **Product Catalog (`catalog-service`)**:
   - Boundary: Product inventory metadata, categories, SKU pricing, and product search.
   - Isolation: Owns `shopops_catalog` DB. Read-optimized with high read/write ratio.
3. **Order Lifecycle (`order-service`)**:
   - Boundary: Order intake, order state machine (`PENDING` -> `PROCESSING` -> `COMPLETED` / `FAILED`), order history, and line-item totals.
   - Isolation: Owns `shopops_order` DB. Emits `order.created` events to RabbitMQ; reacts to `payment.completed` and `inventory.insufficient`.
4. **Inventory Management (`inventory-service`)**:
   - Boundary: Physical and available stock levels, reservation allocations, low-stock threshold detection, and idempotency tracking for stock release.
   - Isolation: Owns `shopops_inventory` DB. Listens for `order.created` and emits `inventory.reserved` or `inventory.insufficient`.
5. **Payment Processing (`payment-service`)**:
   - Boundary: Payment gateway integration emulation, idempotency key validation, transaction records, and payment success/failure state.
   - Isolation: Owns `shopops_payment` DB. Listens for `inventory.reserved` and emits `payment.completed` or `payment.failed`.
6. **Customer Notifications (`notification-service`)**:
   - Boundary: Customer notification delivery, in-app notification inboxes, and external messaging hooks.
   - Isolation: Stateless worker utilizing Redis lists for transient customer message queues. Listens for all domain events across the platform.

Cross-cutting ingress concerns (TLS termination, authentication token validation, request routing, rate limiting, and client error formatting) are exclusively handled by the **`api-gateway`**.

## Alternatives Considered
1. **Combining Order and Inventory**:
   - *Pros*: Easier local database joins when placing an order.
   - *Cons*: Prevents simulating inventory contention, out-of-stock race conditions, and distributed saga compensation patterns, which are central to realistic SRE and AIOps resilience scenarios.
2. **Combining Payment and Order**:
   - *Pros*: Synchronous checkout flow.
   - *Cons*: Violates PCI-DSS compliance separation of concerns and eliminates payment gateway webhook / timeout testing capabilities.

## Consequences
- **Benefits**:
  - Independent scalability (e.g., Catalog can scale read replicas 10x while Payment scales according to transaction security requirements).
  - Clear ownership of state eliminates distributed deadlock hazards.
  - Failures in non-critical components (e.g., Notification Service down) do not block core checkout flows.
- **Trade-offs**:
  - Cross-service data queries (e.g., displaying order line item product names) require API aggregation or event-driven read-model projections.
