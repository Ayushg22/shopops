# ShopOps: Microservices Catalog

This catalog documents all runtime microservices, internal ports, dependencies, database ownership, and exposed endpoints in the ShopOps platform.

---

## 1. Summary Matrix

| Service Name | Port | Base Path | Database / Storage | Inbound Events | Outbound Events | Health Probe |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **api-gateway** | `8000` | `/api/v1/*` | None (Stateless) | None | None | `/health/live`, `/health/ready` |
| **auth-service** | `8001` | `/api/v1/auth` | PostgreSQL (`shopops_auth`) | None | None | `/health/live`, `/health/ready` |
| **catalog-service** | `8002` | `/api/v1/products` | PostgreSQL (`shopops_catalog`) | None | None | `/health/live`, `/health/ready` |
| **order-service** | `8003` | `/api/v1/orders` | PostgreSQL (`shopops_order`) | `payment.completed`, `inventory.insufficient` | `order.created` | `/health/live`, `/health/ready` |
| **inventory-service** | `8004` | `/api/v1/inventory` | PostgreSQL (`shopops_inventory`) | `order.created` | `inventory.reserved`, `inventory.insufficient` | `/health/live`, `/health/ready` |
| **payment-service** | `8005` | `/api/v1/payments` | PostgreSQL (`shopops_payment`) | `inventory.reserved` | `payment.completed`, `payment.failed` | `/health/live`, `/health/ready` |
| **notification-service** | `8006` | `/api/v1/notifications` | Redis (`redis://redis:6379`) | `*.*` (All events) | None | `/health/live`, `/health/ready` |
| **frontend** | `8080` (host) `80` (container) | `/` | None (Static Assets) | None | None | `/health` |

---

## 2. Service Deep Dives

### 2.1 API Gateway (`@shopops/api-gateway`)
- **Port**: 8000
- **Purpose**: Single point of ingress, routing, auth verification, and correlation tracking.
- **Key Routes**:
  - `POST /api/v1/auth/*` ➔ Proxied to `auth-service:8001`
  - `GET /api/v1/products/*` ➔ Proxied to `catalog-service:8002`
  - `POST /api/v1/orders/*`, `GET /api/v1/orders/*` ➔ Proxied to `order-service:8003`
  - `GET /api/v1/inventory/*`, `POST /api/v1/inventory/*` ➔ Proxied to `inventory-service:8004`
  - `GET /api/v1/payments/*` ➔ Proxied to `payment-service:8005`
  - `GET /api/v1/notifications/*` ➔ Proxied to `notification-service:8006`
- **Dependencies**: None (HTTP proxy upstream targets).

### 2.2 Auth Service (`@shopops/auth-service`)
- **Port**: 8001
- **Purpose**: User registration, credential hashing with bcrypt (10 rounds), JWT token issuance.
- **Database**: PostgreSQL `shopops_auth` (`User`, `Role` tables).
- **Key Routes**:
  - `POST /api/v1/auth/register`: Create user account.
  - `POST /api/v1/auth/login`: Authenticate and return JWT token.
  - `GET /api/v1/auth/me`: Validate token and return current user profile.

### 2.3 Catalog Service (`@shopops/catalog-service`)
- **Port**: 8002
- **Purpose**: Product inventory information, SKU management, search, and categorization.
- **Database**: PostgreSQL `shopops_catalog` (`Product`, `Category` tables).
- **Key Routes**:
  - `GET /api/v1/products`: List products with pagination.
  - `GET /api/v1/products/:id`: Get detailed product metadata.
  - `POST /api/v1/products`: Admin creation of new product SKUs.

### 2.4 Order Service (`@shopops/order-service`)
- **Port**: 8003
- **Purpose**: Order placement, order item persistence, order lifecycle state machine.
- **Database**: PostgreSQL `shopops_order` (`Order`, `OrderItem` tables).
- **Event Handling**:
  - Emits: `order.created` on order submission.
  - Consumes: `payment.completed` ➔ transitions status to `COMPLETED`.
  - Consumes: `inventory.insufficient` / `payment.failed` ➔ transitions status to `FAILED`.
- **Key Routes**:
  - `POST /api/v1/orders`: Create new order (returns `201 Accepted` with status `PENDING`).
  - `GET /api/v1/orders/:id`: Get order status and line items.
  - `GET /api/v1/orders/customer/:customerId`: Retrieve customer order history.

### 2.5 Inventory Service (`@shopops/inventory-service`)
- **Port**: 8004
- **Purpose**: Real-time stock reservation, available vs reserved quantity tracking.
- **Database**: PostgreSQL `shopops_inventory` (`InventoryItem`, `StockReservation` tables).
- **Event Handling**:
  - Consumes: `order.created` ➔ checks available stock.
  - Emits: `inventory.reserved` (if sufficient stock exists).
  - Emits: `inventory.insufficient` (if stock is below order request).
- **Key Routes**:
  - `GET /api/v1/inventory/:productId`: Query stock levels.
  - `POST /api/v1/inventory/seed`: Seed initial inventory for testing.

### 2.6 Payment Service (`@shopops/payment-service`)
- **Port**: 8005
- **Purpose**: Payment authorization, idempotent transaction reference generation.
- **Database**: PostgreSQL `shopops_payment` (`Payment`, `Transaction` tables).
- **Event Handling**:
  - Consumes: `inventory.reserved` ➔ executes payment authorization logic.
  - Emits: `payment.completed` (status: `SUCCESS`, generates `tx-<timestamp>-<hash>`).
  - Emits: `payment.failed` (status: `FAILED`).
- **Key Routes**:
  - `GET /api/v1/payments/:orderId`: Query payment status by order ID.

### 2.7 Notification Service (`@shopops/notification-service`)
- **Port**: 8006
- **Purpose**: Ingests all platform domain events, pushes real-time customer inbox alerts.
- **Storage**: Redis list (`inbox:<customerId>`).
- **Event Handling**:
  - Consumes: `*.*` on topic exchange `shopops.events`.
  - Formats user-friendly notification message and stores in Redis list.
- **Key Routes**:
  - `GET /api/v1/notifications/:customerId`: Retrieve notification inbox for a user.

### 2.8 Frontend Web Application (`@shopops/frontend`)
- **Port**: 8080 (Docker host) / 80 (Nginx container)
- **Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS / Vanilla CSS, Nginx Alpine.
- **Features**: Product catalog browsing, cart management, checkout order triggering, order status live polling, notification inbox display.
