# Asynchronous Event Flows

```
Order Service ---> [ order.created ] ---> RabbitMQ
                                              |
                   +--------------------------+--------------------------+
                   |                                                     |
                   v                                                     v
          Inventory Service                                     Notification Service
                   |
           [ inventory.reserved ]
                   |
                   v
            Payment Service
                   |
           [ payment.completed ]
                   |
                   v
             Order Service (Mark COMPLETED)
```
