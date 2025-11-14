import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const url = process.env.REDIS_URL;
        if (!url) {
          throw new Error('REDIS_URL is missing!');
        }

        return new Redis(url, {
          tls: {
            rejectUnauthorized: false,  // Required by Railway
          },
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
