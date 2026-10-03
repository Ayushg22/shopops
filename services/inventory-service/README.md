# ShopOps inventory-service

Stock management, inventory reservation, and release.

## Standard Layering Structure
- `src/config/`: Service configuration & environment loading
- `src/controllers/`: HTTP request handling and response formatting
- `src/routes/`: Route definitions and middleware bindings
- `src/services/`: Core business logic
- `src/repositories/`: Data access layer
- `src/schemas/`: Validation schemas (Zod)
- `src/events/`: Message bus consumers and publishers
- `src/middleware/`: Authentication, correlation ID, error handling
- `src/errors/`: Standardized custom domain errors
- `src/telemetry/`: OpenTelemetry metrics and tracing integration
- `src/app.ts`: Application bootstrap, health checks, and graceful shutdown

## Port
Runs on port: `8004`
