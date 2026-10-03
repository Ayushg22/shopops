#!/usr/bin/env bash
set -e
echo "Starting local infrastructure (PostgreSQL, Redis, RabbitMQ, Observability)..."
docker compose up -d
echo "Waiting for services to become healthy..."
docker compose ps
