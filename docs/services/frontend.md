# Service Documentation: Frontend Web Application (`@shopops/frontend`)

## 1. Overview
The Frontend Web Application is a Single Page Application (SPA) built with React 18, TypeScript, and Vite. In production, it is served via a lightweight Nginx Alpine container with reverse proxying and dynamic DNS resolution.

- **External Port**: 8080 (Docker host)
- **Container Port**: 80
- **Directory**: `apps/frontend/`
- **Container Name**: `shopops-frontend`
- **Base Image**: `nginx:alpine` (<30MB)

---

## 2. Nginx Configuration & Upstream Resolution
To avoid Nginx startup crashes when the API Gateway container is still initializing, `apps/frontend/nginx.conf` employs dynamic runtime DNS resolution:
```nginx
resolver 127.0.0.11 valid=30s ipv6=off;

location /api/ {
    set $upstream_gateway http://api-gateway:8000;
    proxy_pass $upstream_gateway;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Client-side SPA routes fallback to `index.html`:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 3. Health Endpoint
- `GET http://localhost:8080/health` ➔ Returns HTTP `200 OK` with payload `healthy`.
