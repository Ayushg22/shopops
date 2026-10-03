# ADR-009: Argo CD for GitOps Continuous Delivery

## Status
Accepted

## Context
Deploying directly to Kubernetes clusters from CI pipelines using imperative `kubectl apply` commands introduces severe security and reliability anti-patterns:
- CI runners must be granted high-privilege cluster admin credentials.
- Cluster state diverges from Git source code (configuration drift caused by manual edits).
- No automated reconciliation loop to detect and correct cluster deviations.
- Rollback requires re-triggering entire build pipelines.

## Decision
We adopted **Argo CD as the GitOps Continuous Delivery controller**:
1. **Pull-Based GitOps Model**:
   - The Kubernetes cluster pulls its desired state from Git, rather than an external CI runner pushing changes into the cluster.
   - Zero inbound cluster ports required; no Kubernetes credentials shared with CI servers.
2. **Repository Separation / Manifest Layout**:
   - Declarative Helm charts and Kustomize overlays hosted in `k8s/` and `helm/`.
   - Argo CD `Application` custom resources continuously monitor the repository branches (`main`, `staging`, `production`).
3. **Automated Drift Detection & Self-Healing**:
   - Argo CD continuously compares live cluster state against Git manifests.
   - Any manual `kubectl edit` in production is detected as `OutOfSync` and automatically reconciled back to the Git source of truth.
   - Sync policies configured with automated pruning and progressive rollback triggers.

## Alternatives Considered
1. **Flux v2**:
   - *Pros*: Lightweight, native CNCF toolkit.
   - *Cons*: Argo CD provides a superior, battle-tested visual web dashboard for real-time visualization of pod states, sync phases, and health checks, making it ideal for SRE operations and demos.
2. **Direct CI Push (`kubectl apply` in Jenkins)**:
   - *Pros*: Quick to set up initially.
   - *Cons*: Security vulnerability (leaks cluster credentials to CI runner) and lacks automated drift reconciliation. Rejected.

## Consequences
- **Benefits**:
  - Git commit log represents the complete, immutable audit trail of every production deployment.
  - Instant one-click or `git revert` rollback capabilities.
  - Zero cluster credentials stored on external CI build machines.
- **Trade-offs**:
  - Requires running the Argo CD controller in the cluster (~250MB RAM total across Argo server, repo server, and controller).
