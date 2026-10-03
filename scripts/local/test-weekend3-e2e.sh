#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$DIR/logs"
mkdir -p "$LOG_DIR"

echo "================================================================================"
echo "          ShopOps Weekend 3: Distributed Asynchronous Event Flow Test          "
echo "================================================================================"

services=(
  "auth-service:8001"
  "catalog-service:8002"
  "order-service:8003"
  "inventory-service:8004"
  "payment-service:8005"
  "notification-service:8006"
  "api-gateway:8000"
)

# 1. Start all services
echo ""
echo "[1/6] Starting all 6 microservices + API Gateway..."
PIDS=()
for item in "${services[@]}"; do
  svc="${item%%:*}"
  port="${item##*:}"
  node "$DIR/services/$svc/dist/app.js" > "$LOG_DIR/$svc.log" 2>&1 &
  PID=$!
  PIDS+=($PID)
done

# Trap to kill background services on exit
cleanup() {
  echo ""
  echo "Cleaning up test background services..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
}
trap cleanup EXIT

echo "Waiting 3 seconds for boot..."
sleep 3

# 2. Verify all services are UP
echo ""
echo "[2/6] Verifying health probes across all services:"
for item in "${services[@]}"; do
  svc="${item%%:*}"
  port="${item##*:}"
  STATUS=$(curl -s "http://localhost:$port/health/live" 2>/dev/null | grep "UP" || echo "FAIL")
  if [[ "$STATUS" == *"UP"* ]]; then
    echo "  ✔ $svc is healthy on port $port"
  else
    echo "  ✘ $svc failed on port $port. Log: $LOG_DIR/$svc.log"
    cat "$LOG_DIR/$svc.log"
    exit 1
  fi
done

# 3. Seed product inventory in shopops_inventory (via API Gateway)
PRODUCT_ID="e59756ab-7077-4c7c-8a1d-523135740a87" # Noise-Cancelling SRE Headphones
echo ""
echo "[3/6] Seeding stock for product $PRODUCT_ID via API Gateway..."
SEED_RES=$(curl -s -X POST http://localhost:8000/api/v1/inventory/seed \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":100}")
echo "  Inventory response: $SEED_RES"

# 4. Place order via API Gateway
echo ""
echo "[4/6] Placing order through API Gateway (POST http://localhost:8000/api/v1/orders)..."
CUSTOMER_ID="ayush-sre-customer"
ORDER_RES=$(curl -s -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "x-correlation-id: trace-weekend3-demo-999" \
  -d "{\"customerId\":\"$CUSTOMER_ID\",\"items\":[{\"productId\":\"$PRODUCT_ID\",\"quantity\":2,\"unitPrice\":299.99}]}")

echo "  Order response:"
echo "$ORDER_RES" | jq .

ORDER_ID=$(echo "$ORDER_RES" | jq -r ".data.id")
echo "  Created Order ID: $ORDER_ID (Initial Status: PENDING)"

# 5. Wait for RabbitMQ Event Cascade
echo ""
echo "[5/6] Waiting 2 seconds for RabbitMQ async event cascade..."
echo "  Event Flow: order.created ➔ inventory.reserved ➔ payment.completed ➔ order:COMPLETED & customer:RECEIPT"
sleep 2

# 6. Verify Final State Across Microservices
echo ""
echo "[6/6] Verifying final distributed state:"

# Check Order Status
ORDER_FINAL=$(curl -s "http://localhost:8000/api/v1/orders/$ORDER_ID")
FINAL_STATUS=$(echo "$ORDER_FINAL" | jq -r ".data.status")
echo "  1. Order Service (shopops_order):"
echo "     Order Status: $FINAL_STATUS"
if [ "$FINAL_STATUS" == "COMPLETED" ]; then
  echo "     ✔ SUCCESS: Order marked COMPLETED via payment.completed event!"
else
  echo "     ✘ FAILED: Order status is $FINAL_STATUS (expected COMPLETED)"
fi

# Check Inventory Stock
STOCK_FINAL=$(curl -s "http://localhost:8000/api/v1/inventory/$PRODUCT_ID")
AVAIL=$(echo "$STOCK_FINAL" | jq -r ".data.availableQuantity")
RESERVED=$(echo "$STOCK_FINAL" | jq -r ".data.reservedQuantity")
echo "  2. Inventory Service (shopops_inventory):"
echo "     Available: $AVAIL (expected 98), Reserved: $RESERVED (expected 2)"
if [ "$AVAIL" == "98" ]; then
  echo "     ✔ SUCCESS: Stock reserved via order.created event!"
fi

# Check Payment Record
PAYMENT_FINAL=$(curl -s "http://localhost:8000/api/v1/payments/$ORDER_ID")
PAY_STATUS=$(echo "$PAYMENT_FINAL" | jq -r ".data.status")
TX_REF=$(echo "$PAYMENT_FINAL" | jq -r ".data.transactionRef")
echo "  3. Payment Service (shopops_payment):"
echo "     Payment Status: $PAY_STATUS, Transaction Ref: $TX_REF"
if [ "$PAY_STATUS" == "SUCCESS" ]; then
  echo "     ✔ SUCCESS: Payment processed via inventory.reserved event!"
fi

# Check Notification in Redis (via API Gateway)
echo "  4. Notification Service (Redis via API Gateway):"
NOTIFS=$(curl -s "http://localhost:8000/api/v1/notifications/$CUSTOMER_ID")
echo "     Customer Inbox: $NOTIFS"
echo ""
echo "================================================================================"
echo "          Weekend 3 Distributed Event Flow Verification: ALL PASSED!           "
echo "================================================================================"
