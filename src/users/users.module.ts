import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Preference } from './entities/preference.entity';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Preference]),
    RabbitMQModule, // 👈 now RabbitMQService is available here
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
