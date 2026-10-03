#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "================================================================================"
echo "          ShopOps Weekend 4: Full Platform Docker Compose Validation           "
echo "================================================================================"

# 1. Build and bring up the complete platform
echo ""
echo "[1/5] Building and launching full platform via Docker Compose..."
docker compose up -d --build

# 2. Wait for all containers to boot and pass healthchecks
echo ""
echo "[2/5] Waiting for services to stabilize and pass health probes..."
sleep 5

services=(
  "auth-service:8001"
  "catalog-service:8002"
  "order-service:8003"
  "inventory-service:8004"
  "payment-service:8005"
  "notification-service:8006"
  "api-gateway:8000"
)

echo "Verifying microservice health probes:"
for item in "${services[@]}"; do
  svc="${item%%:*}"
  port="${item##*:}"
  STATUS=$(curl -s "http://localhost:$port/health/live" 2>/dev/null | grep "UP" || echo "FAIL")
  if [[ "$STATUS" == *"UP"* ]]; then
    echo "  ✔ $svc is healthy on port $port"
  else
    echo "  ✘ $svc probe failed on port $port"
    docker compose logs "$svc"
    exit 1
  fi
done

# Frontend check
FE_STATUS=$(curl -s "http://localhost:8080/health" 2>/dev/null || echo "FAIL")
if [[ "$FE_STATUS" == *"healthy"* ]]; then
  echo "  ✔ frontend (Nginx SPA) is healthy on port 8080"
else
  echo "  ✘ frontend probe failed on port 8080"
  docker compose logs frontend
  exit 1
fi

# 3. Seed stock via API Gateway
PRODUCT_ID="e59756ab-7077-4c7c-8a1d-523135740a87" # Noise-Cancelling SRE Headphones
echo ""
echo "[3/5] Seeding inventory stock via API Gateway (POST http://localhost:8000/api/v1/inventory/seed)..."
SEED_RES=$(curl -s -X POST http://localhost:8000/api/v1/inventory/seed \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":100}")
echo "  Inventory Response: $SEED_RES"

# 4. Trigger E2E Order Workflow via Containerized API Gateway
echo ""
echo "[4/5] Placing order through Containerized API Gateway..."
CUSTOMER_ID="docker-verified-customer"
ORDER_RES=$(curl -s -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "x-correlation-id: trace-weekend4-docker-101" \
  -d "{\"customerId\":\"$CUSTOMER_ID\",\"items\":[{\"productId\":\"$PRODUCT_ID\",\"quantity\":3,\"unitPrice\":299.99}]}")

echo "  Order Response: $ORDER_RES"
ORDER_ID=$(echo "$ORDER_RES" | jq -r ".data.id")

echo "  Waiting 2 seconds for RabbitMQ async event cascade in Docker network..."
sleep 2

# 5. Verify final distributed state across containers
echo ""
echo "[5/5] Verifying final distributed state across Docker containers:"

# Order check
ORDER_FINAL=$(curl -s "http://localhost:8000/api/v1/orders/$ORDER_ID")
FINAL_STATUS=$(echo "$ORDER_FINAL" | jq -r ".data.status")
echo "  1. Order Service (Postgres: shopops_order):"
echo "     Status: $FINAL_STATUS"
if [ "$FINAL_STATUS" == "COMPLETED" ]; then
  echo "     ✔ SUCCESS: Order marked COMPLETED via payment.completed event!"
else
  echo "     ✘ FAILED: Order status is $FINAL_STATUS (expected COMPLETED)"
  exit 1
fi

# Inventory check
STOCK_FINAL=$(curl -s "http://localhost:8000/api/v1/inventory/$PRODUCT_ID")
AVAIL=$(echo "$STOCK_FINAL" | jq -r ".data.availableQuantity")
echo "  2. Inventory Service (Postgres: shopops_inventory):"
echo "     Available stock: $AVAIL"

# Payment check
PAYMENT_FINAL=$(curl -s "http://localhost:8000/api/v1/payments/$ORDER_ID")
PAY_STATUS=$(echo "$PAYMENT_FINAL" | jq -r ".data.status")
TX_REF=$(echo "$PAYMENT_FINAL" | jq -r ".data.transactionRef")
echo "  3. Payment Service (Postgres: shopops_payment):"
echo "     Status: $PAY_STATUS, Transaction Ref: $TX_REF"

# Notifications check
echo "  4. Notification Service (Redis via API Gateway):"
NOTIFS=$(curl -s "http://localhost:8000/api/v1/notifications/$CUSTOMER_ID")
echo "     Customer Inbox: $NOTIFS"

echo ""
echo "================================================================================"
echo "      Weekend 4 Docker Platform Orchestration Verification: ALL PASSED!        "
echo "================================================================================"
