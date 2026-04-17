import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { MailerModule } from '@nestjs-modules/mailer';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[PrismaModule, AuthModule, MailerModule],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
