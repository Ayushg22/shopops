#!/usr/bin/env bash
# Injects random pod termination in shopops namespace to test Kubernetes self-healing and PDB
NAMESPACE="shopops"
TARGET_DEPLOYMENT="${1:-order-service}"

echo "[Chaos] Deleting a pod from deployment: $TARGET_DEPLOYMENT"
POD=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name="$TARGET_DEPLOYMENT" -o jsonpath='{.items[0].metadata.name}')

if [ -n "$POD" ]; then
  kubectl delete pod "$POD" -n "$NAMESPACE"
  echo "[Chaos] Terminated pod $POD. Observing recovery..."
else
  echo "[Chaos] No running pods found for $TARGET_DEPLOYMENT"
fi
