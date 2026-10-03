#!/usr/bin/env bash
set -e
echo "Setting up local ShopOps development environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi
echo "Local environment ready."
