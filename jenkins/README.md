# ShopOps Jenkins CI

Jenkins owns CI validation and artifact generation:
- Linting and unit tests
- SonarQube SAST
- Gitleaks secret scanning
- Multi-stage Docker builds
- Trivy vulnerability scanning
- Syft SBOM generation
- ACR publishing
- Updating GitOps desired state (Argo CD reconciles to AKS)
