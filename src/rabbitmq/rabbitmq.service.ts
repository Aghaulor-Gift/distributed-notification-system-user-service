import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService {
  private channel: amqp.Channel;

  // Single connect() method (merged both versions)
  async connect() {
    if (this.channel) return;

    const rabbitUrl = process.env.RABBITMQ_URL;
    if (!rabbitUrl) {
      throw new Error('RABBITMQ_URL is not set in environment variables.');
    }

    const connection = await amqp.connect(rabbitUrl);
    this.channel = await connection.createChannel();

    await this.channel.assertExchange('notifications.direct', 'direct', { durable: true });
    console.log('Connected to RabbitMQ and exchange declared');
  }

  // Publisher method
  async publish(exchange: string, routingKey: string, message: any) {
    if (!this.channel) await this.connect();

    const payload = Buffer.from(JSON.stringify(message));
    this.channel.publish(exchange, routingKey, payload);
    console.log(`📤 Published message to ${exchange} (${routingKey}):`, message);
  }
}
