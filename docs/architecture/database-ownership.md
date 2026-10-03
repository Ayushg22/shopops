# ShopOps: Database Ownership & Data Architecture

## 1. Core Principles
1. **Zero Database Sharing**: No microservice is permitted to connect directly to another microservice's database. Cross-service data mutations must flow through asynchronous RabbitMQ events or synchronous API calls.
2. **Schema Encapsulation**: Each microservice owns its Prisma schema (`services/<service>/prisma/schema.prisma`) and generates its own independent client (`@prisma/client-<service>`).
3. **Transactional Isolation**: ACID transactions are strictly confined within a single service's logical database boundary. Cross-service consistency is managed through choreographed Sagas.

---

## 2. Logical Databases Map (PostgreSQL 16)

```
+---------------------------------------------------------------------------------------------------+
|                                    PostgreSQL 16 Engine Cluster                                   |
+-------------------+--------------------+--------------------+--------------------+----------------+
|   shopops_auth    |  shopops_catalog   |   shopops_order    | shopops_inventory  | shopops_payment|
|   (Auth Service)  | (Catalog Service)  |  (Order Service)   |(Inventory Service) |(Payment Service|
+-------------------+--------------------+--------------------+--------------------+----------------+
| - users           | - products         | - orders           | - inventory_items  | - payments     |
| - roles           | - categories       | - order_items      | - stock_reservations - transactions |
+-------------------+--------------------+--------------------+--------------------+----------------+
```

### 2.1 `shopops_auth`
- **Owner**: `auth-service`
- **Connection**: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/shopops_auth?schema=public`
- **Entities**:
  - `User`: `id` (UUID), `email` (Unique), `passwordHash`, `name`, `role`, `createdAt`, `updatedAt`

### 2.2 `shopops_catalog`
- **Owner**: `catalog-service`
- **Connection**: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/shopops_catalog?schema=public`
- **Entities**:
  - `Product`: `id` (UUID), `title`, `description`, `price`, `sku` (Unique), `category`, `imageUrl`, `createdAt`, `updatedAt`

### 2.3 `shopops_order`
- **Owner**: `order-service`
- **Connection**: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/shopops_order?schema=public`
- **Entities**:
  - `Order`: `id` (UUID), `customerId`, `totalAmount`, `status` (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED`), `createdAt`, `updatedAt`
  - `OrderItem`: `id` (UUID), `orderId` (FK to Order), `productId`, `quantity`, `unitPrice`

### 2.4 `shopops_inventory`
- **Owner**: `inventory-service`
- **Connection**: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/shopops_inventory?schema=public`
- **Entities**:
  - `InventoryItem`: `id` (UUID), `productId` (Unique), `availableQuantity`, `reservedQuantity`, `updatedAt`
  - `StockReservation`: `id` (UUID), `orderId`, `productId`, `quantity`, `status` (`HELD`, `COMMITTED`, `RELEASED`), `createdAt`

### 2.5 `shopops_payment`
- **Owner**: `payment-service`
- **Connection**: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/shopops_payment?schema=public`
- **Entities**:
  - `Payment`: `id` (UUID), `orderId` (Unique), `amount`, `currency`, `status` (`PENDING`, `SUCCESS`, `FAILED`), `transactionRef`, `createdAt`, `updatedAt`

---

## 3. Transient & Caching Storage (Redis 7.2)

- **Owner**: `notification-service` and API Gateway (for token blacklisting / session cache)
- **Connection**: `redis://redis:6379`
- **Key Namespace Standards**:
  - `inbox:<customerId>`: Redis List (LPUSH / LRANGE) storing JSON notification payloads for instant customer retrieval.
  - `cache:product:<productId>`: Product detail cache with 5-minute TTL.
  - `ratelimit:<clientIp>`: Sliding window rate limit counters.

---

## 4. Migration & Schema Evolution Strategy
- Schema definitions are version-controlled in Git.
- Local initialization leverages `docker-entrypoint-initdb.d/init-databases.sh` to ensure all 5 databases exist on clean startup.
- In production, migrations run during CI/CD release stages via `npx prisma migrate deploy` prior to rolling out new application container versions.
