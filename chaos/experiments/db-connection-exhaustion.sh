#!/usr/bin/env bash
# Simulates database connection pool leakage
echo "[Chaos] Triggering database connection exhaustion simulation on order-service..."
curl -X POST http://localhost:8000/api/v1/orders/debug/leak-db-connections -H "Content-Type: application/json" -d '{"count": 95}'
