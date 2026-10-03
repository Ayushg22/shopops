# ShopOps API Gateway Specification

All client requests must enter through the API Gateway on port `8000`.

## 1. Global Standards

### 1.1 Headers
- `Content-Type: application/json`
- `Authorization: Bearer <jwt_token>` (for protected endpoints)
- `x-correlation-id: <uuid>` (Optional; if omitted, API Gateway generates a new UUIDv4 and returns it in the response headers)

### 1.2 Unified Response Format (`ApiResponse<T>`)
All endpoints return a uniform JSON envelope:

#### Successful Response (`2xx`)
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2026-10-03T20:25:58.517Z",
    "correlationId": "trace-weekend4-docker-101"
  }
}
```

#### Error Response (`4xx` / `5xx`)
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Requested quantity exceeds available inventory",
    "details": {
      "productId": "e59756ab-7077-4c7c-8a1d-523135740a87",
      "available": 2,
      "requested": 5
    }
  },
  "metadata": {
    "timestamp": "2026-10-03T20:25:58.517Z",
    "correlationId": "trace-weekend4-docker-101"
  }
}
```

---

## 2. API Route Index

### 2.1 Authentication & Profile (`auth-service:8001`)

#### Register User
- **Method & Path**: `POST /api/v1/auth/register`
- **Request Body**:
```json
{
  "email": "customer@shopops.dev",
  "password": "SecurePassword123!",
  "name": "Jane Doe"
}
```
- **Response (`201 Created`)**:
```json
{
  "success": true,
  "data": {
    "id": "c62a8740-0f2c-4e89-8d19-322194918201",
    "email": "customer@shopops.dev",
    "name": "Jane Doe",
    "role": "CUSTOMER"
  }
}
```

#### User Login
- **Method & Path**: `POST /api/v1/auth/login`
- **Request Body**:
```json
{
  "email": "customer@shopops.dev",
  "password": "SecurePassword123!"
}
```
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": "c62a8740-0f2c-4e89-8d19-322194918201",
      "email": "customer@shopops.dev",
      "role": "CUSTOMER"
    }
  }
}
```

#### Current User Profile
- **Method & Path**: `GET /api/v1/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response (`200 OK`)**: Profile metadata.

---

### 2.2 Product Catalog (`catalog-service:8002`)

#### List Products
- **Method & Path**: `GET /api/v1/products`
- **Query Params**: `page=1&limit=10&category=electronics`
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "e59756ab-7077-4c7c-8a1d-523135740a87",
        "title": "Noise-Cancelling SRE Headphones",
        "description": "High performance audio with 40dB active noise cancellation",
        "price": 299.99,
        "sku": "SRE-HEADPHONES-01",
        "category": "electronics"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

#### Get Product Details
- **Method & Path**: `GET /api/v1/products/:id`
- **Response (`200 OK`)**: Single product item.

---

### 2.3 Order Management (`order-service:8003`)

#### Create Order
- **Method & Path**: `POST /api/v1/orders`
- **Request Body**:
```json
{
  "customerId": "cust-84920",
  "items": [
    {
      "productId": "e59756ab-7077-4c7c-8a1d-523135740a87",
      "quantity": 2,
      "unitPrice": 299.99
    }
  ]
}
```
- **Response (`201 Accepted`)**:
```json
{
  "success": true,
  "data": {
    "id": "9d320701-b6ea-437d-88a9-584198b91d92",
    "customerId": "cust-84920",
    "totalAmount": 599.98,
    "status": "PENDING",
    "items": [
      {
        "productId": "e59756ab-7077-4c7c-8a1d-523135740a87",
        "quantity": 2,
        "unitPrice": 299.99
      }
    ]
  }
}
```

#### Get Order by ID
- **Method & Path**: `GET /api/v1/orders/:id`
- **Response (`200 OK`)**: Order with current lifecycle status (`PENDING`, `COMPLETED`, `FAILED`).

---

### 2.4 Inventory (`inventory-service:8004`)

#### Check Stock
- **Method & Path**: `GET /api/v1/inventory/:productId`
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "productId": "e59756ab-7077-4c7c-8a1d-523135740a87",
    "availableQuantity": 98,
    "reservedQuantity": 2
  }
}
```

#### Seed Stock
- **Method & Path**: `POST /api/v1/inventory/seed`
- **Request Body**: `{"productId": "...", "quantity": 100}`

---

### 2.5 Payments (`payment-service:8005`)

#### Get Payment by Order ID
- **Method & Path**: `GET /api/v1/payments/:orderId`
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "id": "pay-92019230-0192",
    "orderId": "9d320701-b6ea-437d-88a9-584198b91d92",
    "amount": 599.98,
    "status": "SUCCESS",
    "transactionRef": "tx-1791059158587-GSSEU3"
  }
}
```

---

### 2.6 Notifications (`notification-service:8006`)

#### Get Customer Notification Inbox
- **Method & Path**: `GET /api/v1/notifications/:customerId`
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "notif-1791059158557",
      "type": "order.created",
      "orderId": "9d320701-b6ea-437d-88a9-584198b91d92",
      "message": "Order #9d320701-b6ea-437d-88a9-584198b91d92 received. Verification in progress.",
      "timestamp": "2026-10-03T20:25:58.557Z"
    }
  ]
}
```
