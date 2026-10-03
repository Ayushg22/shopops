# ADR-003: PostgreSQL Logical Database Ownership

## Status
Accepted

## Context
A fundamental principle of cloud-native microservices is database encapsulation: no service should directly query or mutate another service's database tables. However, running a completely separate PostgreSQL server instance for every microservice in local development or small cloud environments wastes memory, introduces significant connection management overhead, and increases cloud compute costs.

## Decision
We implemented a **Logical Database-per-Service Architecture hosted on a unified PostgreSQL Cluster**:
- A single PostgreSQL 16 server cluster hosts five isolated databases:
  1. `shopops_auth` (Users, Passwords, Roles)
  2. `shopops_catalog` (Products, Categories)
  3. `shopops_order` (Orders, OrderItems)
  4. `shopops_inventory` (Inventory, StockReservations)
  5. `shopops_payment` (Payments, Transactions)
- Each microservice is granted a dedicated connection string (`DATABASE_URL=postgresql://user:pass@postgres:5432/<service_db>?schema=public`).
- Direct cross-database SQL queries or foreign keys between databases are strictly prohibited. Inter-service data sharing must occur via synchronous REST APIs through the Gateway or asynchronous events over RabbitMQ.
- Each service manages its own Prisma schema (`services/<service>/prisma/schema.prisma`) and generates an isolated client (`@prisma/client-<service>`).

## Alternatives Considered
1. **Shared Single Database with Shared Tables**:
   - *Pros*: Simple cross-table joins.
   - *Cons*: Violates microservice autonomy; changes to product tables risk breaking order or inventory queries; impossible to scale or migrate databases independently. Strongly rejected.
2. **Physical Database Instance per Microservice (5 separate PostgreSQL containers/VMs)**:
   - *Pros*: Absolute physical resource isolation.
   - *Cons*: Consumes >1.5GB of RAM locally just for database idling; requires managing 5 separate backup, replication, and telemetry agents. Prohibitive for local workstations and budget-constrained cloud tiers.

## Consequences
- **Benefits**:
  - Enforces strict zero-leakage domain boundaries while keeping total idle database memory consumption below 80MB.
  - Allows future extraction of any database to a dedicated Azure Database for PostgreSQL Flexible Server without changing service application code.
  - Simplifies local Docker Compose initialization via a single volume mount and schema initialization script (`docker-entrypoint-initdb.d`).
- **Trade-offs**:
  - A crash or resource starvation of the single PostgreSQL container affects all 5 databases locally (mitigated by setting strict container CPU/memory limits and deploying HA replicas in production).
