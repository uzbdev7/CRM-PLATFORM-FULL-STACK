import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports:[PrismaModule,AuthModule, MailerModule],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
