#!/usr/bin/env bash
# Injects artificial latency into inventory service to test circuit breaker and timeout alerting
echo "[Chaos] Injected 2500ms latency on inventory-service"
curl -X POST http://localhost:8000/api/v1/inventory/debug/latency -H "Content-Type: application/json" -d '{"delayMs": 2500}'
