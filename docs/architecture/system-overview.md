# System Overview

ShopOps is a cloud-native microservices e-commerce platform built as an SRE and AIOps portfolio laboratory.

```
React Frontend -> API Gateway -> [ Auth | Catalog | Order | Inventory | Payment ] -> RabbitMQ -> Notification Worker
                                        |          |         |           |
                                   PostgreSQL PostgreSQL PostgreSQL PostgreSQL
```
