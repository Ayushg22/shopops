#!/usr/bin/env bash
set -e
echo "Running all unit tests..."
npm run test --workspaces --if-present
