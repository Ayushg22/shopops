import amqp from 'amqplib';
import { BaseEvent } from './events';

export const EXCHANGE_NAME = 'shopops.events';

export class EventBus {
  private connection: any = null;
  private channel: any = null;
  private isConnecting = false;

  constructor(private rabbitmqUrl: string, private serviceName: string) {}

  async connect(): Promise<any> {
    if (this.channel) return this.channel;
    if (this.isConnecting) {
      await new Promise((r) => setTimeout(r, 500));
      return this.connect();
    }

    this.isConnecting = true;
    try {
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
      this.isConnecting = false;
      return this.channel;
    } catch (err) {
      this.isConnecting = false;
      throw err;
    }
  }

  async publish<T>(routingKey: string, payload: T, correlationId: string): Promise<boolean> {
    const ch = await this.connect();
    const event: BaseEvent<T> = {
      eventId: 'evt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      eventType: routingKey,
      timestamp: new Date().toISOString(),
      correlationId,
      source: this.serviceName,
      payload
    };

    return ch.publish(
      EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      { persistent: true, correlationId }
    );
  }

  async subscribe<T>(
    queueName: string,
    routingKeys: string[],
    handler: (event: BaseEvent<T>) => Promise<void>
  ): Promise<void> {
    const ch = await this.connect();
    await ch.assertQueue(queueName, { durable: true });

    for (const key of routingKeys) {
      await ch.bindQueue(queueName, EXCHANGE_NAME, key);
    }

    ch.consume(queueName, async (msg: any) => {
      if (!msg) return;
      try {
        const event: BaseEvent<T> = JSON.parse(msg.content.toString());
        await handler(event);
        ch.ack(msg);
      } catch (error) {
        console.error(`[EventBus] Error handling event in ${this.serviceName}:`, error);
        ch.nack(msg, false, false);
      }
    });
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch {
      // Ignored during shutdown
    }
  }
}
