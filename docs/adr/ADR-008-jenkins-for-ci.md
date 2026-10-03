# ADR-008: Jenkins for Continuous Integration (CI)

## Status
Accepted

## Context
A complete SRE lifecycle requires robust Continuous Integration to validate pull requests, run unit and integration test suites, enforce linting, perform container security scans (Trivy), and publish immutable container images with Git SHA tags. We needed a CI automation engine that can run both on self-hosted infrastructure (local Docker/K8s) and integrate cleanly with cloud pipelines.

## Decision
We adopted **Jenkins with Declarative Pipelines (`Jenkinsfile`) as the primary CI engine**:
1. **Pipeline Architecture**:
   - Codified in versioned `Jenkinsfile` at the repository root.
   - Declarative stages:
     - `Checkout`: Clone source code with commit metadata.
     - `Lint & TypeCheck`: Execute `npm run lint` and `tsc --noEmit` across all workspaces.
     - `Unit & Integration Tests`: Execute `npm test` with code coverage reports.
     - `Container Build`: Multi-stage Docker builds with BuildKit caching.
     - `Security Scan`: Vulnerability scanning using Trivy (failing on critical/high CVEs).
     - `Publish Artifacts`: Push tagged container images (`${GIT_COMMIT_SHORT}`) to registry.
     - `GitOps Update`: Update application image tags in the GitOps repository / Helm values branch.
2. **Containerized Execution**:
   - Jenkins runs containerized with ephemeral Kubernetes agents or Docker-in-Docker (DinD) workers, preventing host environment contamination.

## Alternatives Considered
1. **GitHub Actions**:
   - *Pros*: Zero server management, managed SaaS runners.
   - *Cons*: Hides Jenkins pipeline scripting, agent orchestration, and Jenkins Kubernetes plugin internals which are heavily required in enterprise private cloud and on-premise SRE roles. We will also include GitHub Actions workflows for repo sanity checks, but Jenkins serves as the dedicated enterprise CI showcase.
2. **GitLab CI**:
   - *Pros*: Excellent integrated platform.
   - *Cons*: Requires running an entire GitLab server instance or relying on GitLab SaaS.

## Consequences
- **Benefits**:
  - Full demonstration of enterprise pipeline engineering: declarative syntax, parallel test execution, artifact archiving, and webhook triggers.
  - Complete control over runner infrastructure and build caching.
- **Trade-offs**:
  - Requires maintaining Jenkins master configuration (addressed via Dockerfile and configuration-as-code).
