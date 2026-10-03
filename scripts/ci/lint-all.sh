#!/usr/bin/env bash
set -e
echo "Linting all packages, apps, and services..."
npm run lint --workspaces --if-present
