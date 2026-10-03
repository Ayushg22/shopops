# ShopOps Deployment & GitOps Strategy

This directory contains packaging and declarative deployment manifests for Kubernetes.

- `helm/`: Independent Helm charts for each microservice with parameterized values.
- `gitops/`: Argo CD Application manifests following the "App of Apps" pattern for GitOps reconciliation.
- `k8s-local/`: Standalone manifests for local cluster testing (kind/k3d).
