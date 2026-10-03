#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$DIR/logs"
mkdir -p "$LOG_DIR"

echo "=== Starting ShopOps Microservices & Gateway (Background Deamons) ==="

services=(
  "auth-service:8001"
  "catalog-service:8002"
  "order-service:8003"
  "inventory-service:8004"
  "payment-service:8005"
  "notification-service:8006"
  "api-gateway:8000"
)

for item in "${services[@]}"; do
  svc="${item%%:*}"
  port="${item##*:}"
  echo "Starting $svc on port $port..."
  nohup node "$DIR/services/$svc/dist/app.js" > "$LOG_DIR/$svc.log" 2>&1 &
  echo $! > "$LOG_DIR/$svc.pid"
done

echo "Waiting 3 seconds for services to initialize..."
sleep 3

for item in "${services[@]}"; do
  svc="${item%%:*}"
  port="${item##*:}"
  STATUS=$(curl -s "http://localhost:$port/health/live" 2>/dev/null | grep "UP" || echo "FAIL")
  if [[ "$STATUS" == *"UP"* ]]; then
    echo "  [OK] $svc is UP on port $port"
  else
    echo "  [ERROR] $svc failed on port $port. Check $LOG_DIR/$svc.log"
  fi
done
