# ShopOps: Continuous Integration & Continuous Delivery (CI/CD)

This document details the pipeline architecture, quality gates, and automated deployment mechanics across the ShopOps platform.

---

## 1. High-Level CI/CD Workflow

```
[Developer Git Push]
         |
         v
+-------------------------------------------------------------------+
|               Continuous Integration (Jenkins Pipeline)           |
|                                                                   |
| 1. Lint & Format Check (ESLint, Prettier)                         |
| 2. TypeScript Compile Validation (tsc --noEmit)                   |
| 3. Unit & Integration Tests (Jest)                                |
| 4. Security Scan (Trivy Container & Dependency Vulnerabilities)  |
| 5. Multi-Stage Docker Builds (BuildKit Cache)                     |
| 6. Image Push to Registry (Tagged with Short Git SHA)             |
| 7. Commit New Image Tag to GitOps Repository                      |
+---------------------------------+---------------------------------+
                                  |
                                  | Git Commit to k8s/helm manifests
                                  v
+-------------------------------------------------------------------+
|               Continuous Delivery (Argo CD GitOps Engine)         |
|                                                                   |
| 1. Detects OutOfSync Git commit                                   |
| 2. Computes diff against live Kubernetes Cluster                  |
| 3. Executes Rolling Update Deployment                             |
| 4. Evaluates Pod Readiness & Liveness Probes                      |
| 5. Reconciles cluster to desired Git state (Self-Healing)         |
+-------------------------------------------------------------------+
```

---

## 2. CI Pipeline Stages (`Jenkinsfile`)

```groovy
pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
metadata:
  labels:
    role: jenkins-agent
spec:
  containers:
  - name: node
    image: node:20-slim
    command: ['cat']
    tty: true
  - name: docker
    image: docker:dind
    securityContext:
      privileged: true
'''
        }
    }
    stages {
        stage('Lint & TypeCheck') {
            steps {
                container('node') {
                    sh 'npm ci'
                    sh 'npm run lint'
                    sh 'npx tsc --noEmit'
                }
            }
        }
        stage('Test') {
            steps {
                container('node') {
                    sh 'npm test -- --coverage'
                }
            }
        }
        stage('Docker Build & Scan') {
            steps {
                container('docker') {
                    sh 'docker compose build'
                    sh 'trivy image --severity HIGH,CRITICAL shopops-api-gateway'
                }
            }
        }
        stage('Publish Artifacts') {
            when {
                branch 'main'
            }
            steps {
                container('docker') {
                    sh 'docker tag shopops-api-gateway:latest ${ACR_REGISTRY}/api-gateway:${GIT_COMMIT_SHORT}'
                    sh 'docker push ${ACR_REGISTRY}/api-gateway:${GIT_COMMIT_SHORT}'
                }
            }
        }
        stage('GitOps Sync') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                git clone https://github.com/Ayushg22/shopops-gitops.git
                cd shopops-gitops
                sed -i "s/tag: .*/tag: ${GIT_COMMIT_SHORT}/g" values-dev.yaml
                git commit -am "chore(release): bump image tag to ${GIT_COMMIT_SHORT}"
                git push origin main
                '''
            }
        }
    }
}
```

---

## 3. GitOps Continuous Delivery (Argo CD)
- **Desired State**: Managed in declarative Helm values files.
- **Automated Sync**: Configured with `prune: true` and `selfHeal: true`.
- **Progressive Delivery**: Can be extended with Argo Rollouts for Canary or Blue/Green traffic shifting based on Prometheus error rate metrics.
