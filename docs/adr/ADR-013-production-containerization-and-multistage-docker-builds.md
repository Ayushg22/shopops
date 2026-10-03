# ADR-013: Production Containerization and Multi-Stage Docker Builds

## Status
Accepted

## Context
Deploying raw Node.js applications or fat container images creates substantial security vulnerabilities, bloated image sizes (over 1GB per image), slow CI/CD transfer speeds, and privilege escalation risks if running as the default root user. Additionally, development dependencies (`devDependencies`, TypeScript compiler, testing frameworks) should never exist in production runtime environments.

## Decision
We adopted **Optimized Multi-Stage Docker Builds with Non-Root Execution across All Microservices and the Frontend SPA**:
1. **Multi-Stage Node.js Microservice Dockerfiles (`node:20-slim`)**:
   - **Stage 1 (`builder`)**:
     - Copies root workspace configuration and source trees.
     - Runs `npm ci` and generates service-specific Prisma engines (`npx prisma generate`).
     - Compiles TypeScript source to production JavaScript in `dist/`.
   - **Stage 2 (`runner`)**:
     - Starts from clean `node:20-slim` base image.
     - Installs only minimal runtime dependencies (`curl`, `openssl`).
     - Drops privileges to non-root user `USER node` (`node:node`).
     - Copies only compiled `dist/`, production `node_modules`, and package artifacts.
     - Enforces Docker `HEALTHCHECK` with curl live probes (`/health/live`).
2. **Multi-Stage Frontend SPA Dockerfile (`nginx:alpine`)**:
   - **Stage 1 (`builder`)**: Compiles React Vite SPA to static HTML/CSS/JS bundles.
   - **Stage 2 (`runner`)**: Serves via lightweight Nginx Alpine image (<30MB).
   - **Dynamic DNS Resolution**: Configures `resolver 127.0.0.11 valid=30s ipv6=off;` with variable upstream `set $upstream_gateway http://api-gateway:8000;` to prevent Nginx startup crashes when upstream microservices are booting.
   - Configures SPA client-side routing fallback (`try_files $uri $uri/ /index.html;`).
3. **Build Context Optimization (`.dockerignore`)**:
   - Employs recursive globbing (`**/node_modules/`, `**/dist/`, `**/.env`, `**/.git`) to reduce Docker daemon build context upload from ~500MB to under 600KB, accelerating build times by >10x.
4. **Orchestration Guardrails in Docker Compose**:
   - Explicit CPU limits (`cpus: '0.5'`) and memory caps (`memory: 256M` for services, `128M` for frontend).
   - Strict `depends_on` with `condition: service_healthy` to eliminate startup race conditions with Postgres, Redis, and RabbitMQ.

## Alternatives Considered
1. **Single-Stage Dockerfiles**:
   - *Pros*: Slightly fewer lines in Dockerfile.
   - *Cons*: Retains TypeScript compiler, linters, devDependencies, and build tools inside the production image. Creates ~1.2GB image size with hundreds of unpatched CVEs. Strongly rejected.
2. **Running Containers as `root`**:
   - *Pros*: No file permission concerns during container build.
   - *Cons*: Violates fundamental container security standards (CWE-250). If a remote code execution vulnerability exists in an Express route, the attacker gains root privileges on the container host.

## Consequences
- **Benefits**:
  - Tiny, secure runtime images (<150MB for microservices, <30MB for frontend).
  - Immunity to root-container privilege escalation attacks.
  - Native container health checks integrated with Docker Compose and future Kubernetes pod lifecycle management.
- **Trade-offs**:
  - Building 8 multi-stage images from scratch requires careful layer caching to avoid redundant `npm ci` invocations (addressed via BuildKit caching and `.dockerignore`).
