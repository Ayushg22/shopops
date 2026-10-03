# Database Ownership

Each microservice logically owns its own relational schema within PostgreSQL. No service queries another service's tables directly.
