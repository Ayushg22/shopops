#!/usr/bin/env bash
echo "Verifying health endpoints across services..."
SERVICES=("8000" "8001" "8002" "8003" "8004" "8005" "8006" "8090")
for PORT in "${SERVICES[@]}"; do
  curl -s -o /dev/null -w "%{http_code} on port $PORT\n" "http://localhost:$PORT/health/live" || echo "Port $PORT offline"
done
