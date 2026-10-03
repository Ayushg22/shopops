# Service Documentation: Auth Service (`@shopops/auth-service`)

## 1. Overview
The Auth Service manages user accounts, role-based access control (RBAC), password hashing with bcrypt, and signed JWT token issuance.

- **Port**: 8001
- **Directory**: `services/auth-service/`
- **Database**: PostgreSQL `shopops_auth`
- **Container Name**: `shopops-auth-service`

---

## 2. Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Listening HTTP port | `8001` |
| `NODE_ENV` | Runtime mode | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://shopops:secret@postgres:5432/shopops_auth?schema=public` |
| `JWT_SECRET` | Secret key for signing tokens | `super_secure_jwt_secret_for_dev_mode_shopops` |
| `LOG_LEVEL` | Logging level | `info` |

---

## 3. Endpoints

- `POST /api/v1/auth/register`: Create user account.
- `POST /api/v1/auth/login`: Authenticate credentials, return JWT token.
- `GET /api/v1/auth/me`: Validate JWT token, return user details.
- `GET /health/live`, `GET /health/ready`: Container liveness/readiness probes.
