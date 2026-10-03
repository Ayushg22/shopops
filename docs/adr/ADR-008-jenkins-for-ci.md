# ADR-008: Jenkins for CI

## Status
Accepted

## Context
ShopOps requires clear architectural contracts to ensure a consistent distributed systems foundation and high portfolio value.

## Decision
Jenkins pipeline handles checkout, lint, tests, SAST (SonarQube), secret scanning (Gitleaks), container scanning (Trivy), SBOM (Syft), and ACR image publishing.

## Alternatives Considered
Evaluated monolith vs microservices, multi-database instances vs shared cluster, and direct push CI vs GitOps.

## Consequences
Enforces realistic enterprise practices, guarantees reproducibility, and maintains low cloud spend.
