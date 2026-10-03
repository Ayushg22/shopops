export interface BaseEvent<T> {
  eventId: string;
  eventType: string;
  timestamp: string;
  correlationId: string;
  source: string;
  payload: T;
}

export interface OrderCreatedPayload {
  orderId: string;
  customerId: string;
  totalAmount: number;
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
}

export interface InventoryReservedPayload {
  orderId: string;
  reservationId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export interface PaymentCompletedPayload {
  orderId: string;
  paymentId: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED';
}

export interface NotificationPayload {
  recipientId: string;
  channel: 'EMAIL' | 'SMS' | 'IN_APP';
  template: string;
  context: Record<string, unknown>;
}
