import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import type { Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly exchange = 'notifications.direct';

  async connect() {
    const url = process.env.RABBITMQ_URL;
    if (!url) throw new Error('RABBITMQ_URL environment variable not set');

    try {
      this.logger.log(`Connecting to RabbitMQ at ${url}...`);

      // ✅ Correct double-cast
      this.connection = (await amqp.connect(url)) as unknown as Connection;
      this.channel = (await this.connection.createChannel() as Channel) as Channel;

      if (!this.channel) throw new Error('Failed to create channel.');
      await this.channel.assertExchange(this.exchange, 'direct', { durable: true });

      this.logger.log('✅ Connected to RabbitMQ and exchange declared.');

      this.connection.on('close', async () => {
        this.logger.warn('⚠️ RabbitMQ connection closed. Reconnecting...');
        this.connection = null;
        this.channel = null;
        await this.reconnect();
      });

      this.connection.on('error', (err) => {
        this.logger.error(`❌ RabbitMQ connection error: ${err.message}`);
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`❌ RabbitMQ connection failed: ${errorMsg}`);
      await this.reconnect();
    }
  }

  private async reconnect(retries = 5, delayMs = 5000) {
    for (let i = 0; i < retries; i++) {
      this.logger.log(`🔄 Attempting RabbitMQ reconnect (${i + 1}/${retries})...`);
      try {
        await this.connect();
        return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    this.logger.error('❌ Failed to reconnect to RabbitMQ after multiple attempts.');
  }

  async publish(exchange: string, routingKey: string, message: Record<string, any>) {
    if (!this.channel) {
      this.logger.warn(' Channel not initialized, reconnecting...');
      await this.connect();
    }

    try {
      const payload = Buffer.from(JSON.stringify(message));
      this.channel!.publish(exchange, routingKey, payload);
      this.logger.log(` Message published to ${routingKey}: ${JSON.stringify(message)}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`❌ Failed to publish message: ${errorMsg}`);
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await (this.connection as Connection);
        this.connection = null;
      }
      this.logger.log('RabbitMQ connection closed gracefully.');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error closing RabbitMQ connection: ${errorMsg}`);
    }
  }

  async onModuleDestroy() {
    await this.close();
  }
}
