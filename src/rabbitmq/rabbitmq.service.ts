import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly logger = new Logger(RabbitMQService.name);

  async connect(): Promise<void> {
    try {
      const url = process.env.RABBITMQ_URL;

      if (!url) {
        throw new Error('Missing RABBITMQ_URL in environment variables.');
      }

      // Properly typed connection
      const connection: amqp.Connection = await amqp.connect(url);
      const channel: amqp.Channel = await connection.createChannel();

      await channel.assertExchange('notifications.direct', 'direct', { durable: true });

      // Save references safely
      this.connection = connection;
      this.channel = channel;

      this.logger.log('Connected to RabbitMQ and exchange declared');
    } catch (error: any) {
      this.logger.error(' Failed to connect to RabbitMQ:', error.message);
    }
  }

  async publish(exchange: string, routingKey: string, message: object): Promise<void> {
    if (!this.channel) {
      this.logger.error('RabbitMQ channel not initialized. Message dropped.');
      return;
    }

    try {
      const buffer = Buffer.from(JSON.stringify(message));
      this.channel.publish(exchange, routingKey, buffer);
      this.logger.log(`Published message to ${exchange} (${routingKey})`);
    } catch (error: any) {
      this.logger.error(' Failed to publish message:', error.message);
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.logger.log('✅ RabbitMQ channel closed.');
      }
      if (this.connection) {
        await this.connection.close();
        this.logger.log('✅ RabbitMQ connection closed.');
      }
    } catch (error: any) {
      this.logger.error('⚠️ Error closing RabbitMQ connection:', error.message);
    }
  }
}
